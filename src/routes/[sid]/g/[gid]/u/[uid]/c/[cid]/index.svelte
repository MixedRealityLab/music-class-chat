<script context="module" lang="ts">
	import type {Preload} from "@sapper/common";
	import type {GenericResponse, UUser} from "../../../../../../../../_types";

	export const preload: Preload = async function (this, page, session) {
		const {sid, gid, uid, cid} = page.params;
		const ures = await this.fetch(`api/user/${sid}/g/${gid}/u/${uid}`);
		if (ures.status !== 200) {
			return {error: `Sorry, there was a problem (${ures.status})`};
		}
		const udata = await ures.json() as GenericResponse;
		if (udata.error) {
			return {error: udata.error};
		}
		let user = udata as UUser;
		const ucres = await this.fetch(`api/user/${sid}/g/${gid}/u/${uid}/c/${cid}`);
		if (ucres.status !== 200) {
			return {error: `Sorry, there was a problem (${ucres.status})`};
		}
		const ucdata = await ucres.json() as GenericResponse;
		if (ucdata.error) {
			return {error: ucdata.error};
		}
		let userchat = ucdata as UUser;

		return {user, userchat};
	}
</script>
<script lang="ts">
	import AppBar from '../../../../../../../../components/AppBar.svelte';
	import Content from '../../../../../../../../components/Content.svelte';
	import {stores} from '@sapper/app';
	import {onDestroy, onMount} from 'svelte';
	import {getNextStep, isEnabled} from '../../../../../../../../_logic';
	import type {
		AddUserMessageRequest,
		ChatDef,
		UserChat,
		UserMessage,
		UUser
	} from '../../../../../../../../_types';

	export let error: string;
	export let user: UUser;
	export let userchat: UserChat;

	const {page} = stores();
	const {sid, gid, uid, cid} = $page.params;
	const markup = new RegExp(/^\[([am][bct]?)]\s*(.*)$/)
	let backurl = `${sid}/g/${gid}/u/${uid}/`
	let reftime = new Date()
	let waitfor: string [] = null
	let timer = null
	let messages: UserMessage[] = userchat.messages
	messages.forEach(message => {
		if (message.message != null) {
			let result = markup.exec(message.message)
			if (result != null) {
				message.message = result[2]
				message.style = result[1]
			}
		}
	})

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});

	onMount(checkMessages);

	async function checkMessages() {
		// chat might enable/deliver a message/content/rewards
		// or return some waitfors (and a timer?)
		timer = null;
		let userinput: string = "";
		if (userchat.messages.length > 0) {
			userinput = userchat.messages[userchat.messages.length - 1].userinput;
		}
		let now = new Date();
		const chatdef = userchat.chatdef as ChatDef // trust me!
		console.log(chatdef)
		const nextstep = getNextStep(user, userchat, chatdef, (now.getTime() - reftime.getTime()) / 1000, userinput);
		console.log(`nextstep`, nextstep);
		// TODO
		if (nextstep.done)
			return;
		if (nextstep.after !== undefined && nextstep.after !== null) {
			timer = setTimeout(checkMessages, nextstep.after);
			return;
		}
		if (nextstep.waitfor && nextstep.waitfor.length > 0) {
			waitfor = nextstep.waitfor;
			return;
		}
		if (nextstep.do) {
			let umsg: UserMessage = {
				message: nextstep.do.message,
				content: nextstep.do.content,
				rewardicons: [],
				date: new Date().toISOString(),
			}
			if (nextstep.do.rewards) {
				for (let reward of nextstep.do.rewards) {
					let ur = user.rewards.find((r) => r._id == reward);
					if (ur && ur.icon) {
						umsg.rewardicons.push(ur.icon);
					}
				}
			}
			while (userchat.nextix < chatdef.messages.length && chatdef.messages[userchat.nextix].ornext) {
				userchat.nextix++;
			}
			userchat.nextix++;

			if (nextstep.do.jumpto) {
				for (let ix in chatdef.messages) {
					if (nextstep.do.jumpto == chatdef.messages[ix].label) {
						userchat.nextix = ix;
						break;
					}
				}
			}

			// patch client
			userchat.messages.push(umsg);
			messages = userchat.messages;
			// rewards, reset
			if (nextstep.do.rewards) {
				for (let reward of nextstep.do.rewards) {
					let userreward = user.rewards.find((ur) => ur._id == reward);
					if (userreward) {
						console.log(`got reward ${userreward._id}`);
						userreward.got = true;
					} else {
						console.log(`could not find reward ${reward} to add`);
					}
				}
			}
			if (nextstep.do.reset) {
				for (let reward of nextstep.do.reset) {
					let userreward = user.rewards.find((ur) => ur._id == reward);
					if (userreward) {
						console.log(`reset reward ${userreward._id}`);
						userreward.got = false;
					} else {
						console.log(`could not find reward ${reward} to reset`);
					}
				}
			}
			// enabled, etc. on UserChats
			for (let uc of user.chats) {
				uc.enabled = isEnabled(user.rewards, uc.allof, uc.andnot);
			}
			// content
			if (nextstep.do.content && !nextstep.do.content.hidden) {
				user.content.push(nextstep.do.content);
				user.content.sort((a, b) => (a.sortorder ? a.sortorder : 0) - (b.sortorder ? b.sortorder : 0));
			}
			// update server
			// TODO: waiting ?
			updateServer(umsg, nextstep.do.rewards, nextstep.do.reset, userchat.nextix, false);
			timer = setTimeout(checkMessages, 250);
		}
	}

	function handleUserInput(userinput: string) {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		let umsg: UserMessage = {
			userinput: userinput,
			date: new Date().toISOString(),
		}
		// patch client
		userchat.messages.push(umsg);
		messages = userchat.messages;
		waitfor = [];
		// update server
		// TODO waiting ?
		updateServer(umsg, [], [], userchat.nextix, false);

		timer = setTimeout(checkMessages, 250);
	}

	// async? or just hope...
	async function updateServer(umsg: UserMessage, rewards: string[], reset: string[], nextix: number, waiting: boolean) {
		const req: AddUserMessageRequest = {
			message: umsg,
			rewards,
			reset,
			nextix,
			waiting,
		}
		const res = await fetch(`api/user/${sid}/g/${gid}/u/${uid}/c/${cid}/addmessage`, {
			method: "POST",
			body: JSON.stringify(req),
			headers: {'Content-Type': 'application/json'},
		});
		if (res.status !== 200) {
			console.log(`error updating server (${res.status})`);
			return;
		}
		const data = await res.json() as GenericResponse;
		if (data.error) {
			console.log(`error updating server: udata.error`);
		} else {
			console.log(`updated server`);
		}
	}

</script>

<style>
    .message-mt, .message-at {
        @apply text-3xl mb-8
    }

    .message-mb, .message-ab, .message-mt, .message-at {
        @apply font-bold
    }

    .message-m, .message-mb, .message-mt {
        @apply text-center text-white
    }

    .message-at {
        @apply text-left text-purple-400 text-xl mb-2
    }

    .message-a, .message-ab {
        @apply text-left text-white
    }

    .message-ac {
        @apply text-left text-purple-400 text-sm
    }
</style>

<AppBar backpage="{backurl}">
	{#if user.group.site.logo}
		<img class="px-4 h-16 pb-8" src="{user.group.site.logo}" alt="Logo">
	{/if}
</AppBar>
<div class="pt-20 px-2 max-w-3xl mx-auto">

	{#if error}
		<p>ERROR: {error}</p>
	{:else}
		<div class="p-4 flex flex-col items-center text-white">
			{#if userchat.chatdef.icon}
				<img src="{userchat.chatdef.icon}" alt="Chat Icon"/>
			{/if}

			{#each messages as um}
				{#if um.userinput}
					<div class="mt-4 mb-2 block py-2 px-6 flex rounded-2xl text-gray-300"
					     style="filter: saturate(80%); {userchat.chatdef.secondaryColour != null? 'background: linear-gradient(90deg, ' + userchat.chatdef.primaryColour + ',' + userchat.chatdef.secondaryColour + ')' : 'background: ' + userchat.chatdef.primaryColour}">
						{um.userinput}
					</div>
				{/if}

				{#if um.message}
					<div class="{um.style ? 'message-' + um.style: ''}"
					     style="{um.style === 'mt' ? 'color: ' +  userchat.chatdef.primaryColour: '' }">
						{um.message}
					</div>
				{/if}

				{#if um.content}
					<Content content="{um.content}"/>
				{/if}

				{#if um.rewardicons}
					{#each um.rewardicons as icon}
						<div>
							<p><img src="{icon}" alt="{icon}"></p>
						</div>
					{/each}
				{/if}
			{/each}
		</div>

		{#if waitfor && waitfor.length > 0 }
			<div class="mt-3 grid grid-cols-1 gap-2 bg-gray-800 p-2">
				<p class="text-white">Waiting for you to say...</p>
				{#each waitfor as userinput}
					<button class="mt-4 mb-2 block py-2 px-6 flex rounded-2xl cursor-pointer"
					        on:click={handleUserInput(userinput)}
					        style="{userchat.chatdef.primaryColour != null && userchat.chatdef.secondaryColour != null? 'background: linear-gradient(90deg, ' + userchat.chatdef.primaryColour + ',' + userchat.chatdef.secondaryColour + ')' : 'background: ' + userchat.chatdef.primaryColour}">
						{userinput}
					</button>
				{/each}
			</div>
		{/if}

	{/if}
</div>
