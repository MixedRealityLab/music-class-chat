<script context="module" lang="ts">
	import {assets, base} from '$app/paths'
	import type {GenericResponse, UserChat, UUser} from "$lib/types";
	import type {LoadInput, LoadOutput} from "@sveltejs/kit"

	// HACK: Disable server-side rendering for now, can't cope with a base path
	export const ssr = false;

	export async function load({fetch, page}: LoadInput): Promise<LoadOutput> {
		const {gid, uid, cid} = page.params
		const userRes = await fetch(`${base}/api/user/${gid}/${uid}`)
		if(!userRes.ok) {
			return {status: userRes.status, error: `Sorry, there was a problem (${userRes.status})`}
		}
		const userData = await userRes.json() as GenericResponse
		if (userData.error) {
			return {error: userData.error}
		}
		let user = userData as UUser
		const chatResponse = await fetch(`${base}/api/user/${gid}/${uid}/c/${cid}`)
		if (chatResponse.status !== 200) {
			return {status: chatResponse.status, error: `Sorry, there was a problem (${chatResponse.status})`}
		}
		const chatData = await chatResponse.json() as GenericResponse
		if (chatData.error) {
			return {error: chatData.error}
		}
		let chat = chatData as UserChat
		return {props: {user, chat}}
	}
</script>
<script lang="ts">
	import AppBar from '$lib/components/AppBar.svelte'
	import Content from '$lib/components/Content.svelte'
	import {page} from '$app/stores'
	import {goto} from '$app/navigation'
	import {onDestroy, onMount, afterUpdate} from 'svelte'
	import {getNextStep, isFreeTextInput, isBack, isEnabled} from '$lib/logic'
	import type {AddUserMessageRequest, ChatDef, UserChat, UserMessage, UUser} from '$lib/types'

	export let error: string
	export let user: UUser
	export let chat: UserChat

	const checkFreq = 250
	const {gid, uid, cid} = $page.params
	const markup = new RegExp(/^\[([am][bct]?)]\s*(.*)$/gsmi)
	let backurl = `${base}/${gid}/${uid}/`
	let reftime = new Date()
	let waitfor: string [] = null
	let timer = null
	let autoscroll = false

	afterUpdate(() => {
		if (autoscroll) {
			document.scrollingElement.scroll({top: document.scrollingElement.scrollHeight, behavior: 'smooth'})
		}
	})

	onDestroy(() => {
		if (timer) clearTimeout(timer)
	})

	onMount(checkMessages)

	function formatMessage(message) {
		if (message.message != null) {
			let result = markup.exec(message.message)
			if (result != null) {
				message.message = result[2]
				message.style = result[1]
			}
		}
	}

	async function checkMessages() {
		// chat might enable/deliver a message/content/rewards
		// or return some waitfors (and a timer?)
		chat.messages.forEach(message => {
			formatMessage(message)
		})

		timer = null
		let userInput = ""
		if (chat.messages.length > 0) {
			userInput = chat.messages[chat.messages.length - 1].userinput
		}
		let now = new Date()
		const chatDef = chat.chatdef as ChatDef // trust me!
		const nextstep = getNextStep(user, chat, chatDef, (now.getTime() - reftime.getTime()) / 1000, userInput)
		// TODO
		if (nextstep.done)
			return
		if (nextstep.after !== undefined && nextstep.after !== null) {
			timer = setTimeout(checkMessages, nextstep.after)
			return
		}
		if (nextstep.waitfor && nextstep.waitfor.length > 0) {
			waitfor = nextstep.waitfor
			return
		}
		if (nextstep.do) {
			autoscroll = true
			let umsg: UserMessage = {
				message: nextstep.do.message,
				content: nextstep.do.content,
				rewardicons: [],
				date: new Date().toISOString(),
			}
			if (umsg.message != null) {
				let result = markup.exec(umsg.message)
				if (result != null) {
					umsg.message = result[2]
					umsg.style = result[1]
				}
			}
			if (nextstep.do.rewards) {
				for (const reward of nextstep.do.rewards) {
					const ur = user.rewards.find((r) => r._id == reward)
					if (ur && ur.icon) {
						umsg.rewardicons.push(ur.icon)
					}
				}
			}
			while (chat.nextix < chatDef.messages.length && chatDef.messages[chat.nextix].ornext) {
				chat.nextix++
			}
			chat.nextix++

			if (nextstep.do.jumpto) {
				for (let index = 0; index < chatDef.messages.length; index++) {
					if (nextstep.do.jumpto == chatDef.messages[index].label) {
						chat.nextix = index
						break
					}
				}
			}

			// patch client
			formatMessage(umsg)
			chat.messages.push(umsg)

			// rewards, reset
			if (nextstep.do.rewards) {
				for (let reward of nextstep.do.rewards) {
					let userreward = user.rewards.find((ur) => ur._id == reward)
					if (userreward) {
						//console.log(`got reward ${userreward._id}`)
						userreward.got = true
					} else {
						console.log(`could not find reward ${reward} to add`)
					}
				}
			}
			if (nextstep.do.reset) {
				for (let reward of nextstep.do.reset) {
					let userreward = user.rewards.find((ur) => ur._id == reward)
					if (userreward) {
						//console.log(`reset reward ${userreward._id}`)
						userreward.got = false
					} else {
						console.log(`could not find reward ${reward} to reset`)
					}
				}
			}
			// enabled, etc. on UserChats
			for (let uc of user.chats) {
				uc.enabled = isEnabled(user.rewards, uc.allof, uc.andnot)
			}
			// content
			if (nextstep.do.content && !nextstep.do.content.hidden) {
				user.content.push(nextstep.do.content)
				user.content.sort((a, b) => (a.sortorder ? a.sortorder : 0) - (b.sortorder ? b.sortorder : 0))
			}

			// update server
			// TODO: waiting ?
			updateServer(umsg, nextstep.do.rewards, nextstep.do.reset, chat.nextix, false)
			timer = setTimeout(checkMessages, checkFreq)
		}
	}

	function handleTextInput(event: Event) {
		const input = event.target as HTMLInputElement
		const value = input.value
		if (value.trim() != '') {
			handleUserInput(value)
		}
	}

	function handleUserInput(userInput: string) {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
		const userMessage: UserMessage = {
			userinput: userInput,
			date: new Date().toISOString(),
		}
		// patch client
		chat.messages.push(userMessage)
		waitfor = []
		// update server
		// TODO waiting ?
		updateServer(userMessage, [], [], chat.nextix, false)

		timer = setTimeout(checkMessages, checkFreq)
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
		const res = await fetch(`${base}/api/user/${gid}/${uid}/c/${cid}/addmessage`, {
			method: "POST",
			body: JSON.stringify(req),
			headers: {'Content-Type': 'application/json'},
		})
		if (res.status !== 200) {
			console.log(`error updating server (${res.status})`)
			return
		}
		const data = await res.json() as GenericResponse
		if (data.error) {
			console.log(`error updating server: udata.error`)
		} else {
			console.log(`updated server`)
		}
	}
</script>

<style>
    .message-mt, .message-at {
        @apply text-3xl mb-8;
    }

    .message-mb, .message-ab, .message-mt, .message-at {
        @apply font-bold;
    }

    .message-m, .message-mb, .message-mt {
        @apply text-center text-white;
    }

    .message-at {
        @apply text-left text-purple-400 text-xl mb-2;
    }

    .message-a, .message-ab {
        @apply text-left text-white;
    }

    .message-ac {
        @apply text-left text-purple-400 text-sm w-full md:w-1/2 pb-4;
        filter: saturate(0.4) brightness(1.2);
    }
</style>

<svelte:head>
	<title></title>
</svelte:head>

<AppBar backpage="{backurl}">
	<div class="flex flex-1 justify-center items-center">
		<img alt="Logo" class="p-4 h-16 mr-16" src="{assets}/logo.png">
	</div>
</AppBar>
<div class="pt-20 px-2 max-w-3xl mx-auto">

	{#if error}
		<p>ERROR: {error}</p>
	{:else}
		<div class="p-4 flex flex-col items-center text-white">
			{#if chat.chatdef.icon}
				<img src="{assets}/{chat.chatdef.icon}" alt="Chat Icon"/>
			{/if}

			{#each chat.messages as message}
				{#if !message.hidden}
					{#if message.userinput}
						<div class="mb-6 mt-2 block py-2 px-6 flex rounded-2xl text-gray-200"
						     style="filter: saturate(40%); {chat.chatdef.secondaryColour != null? 'background: linear-gradient(90deg, ' + chat.chatdef.primaryColour + '66,' + chat.chatdef.secondaryColour + '66)' : 'background: ' + chat.chatdef.primaryColour + '66'}">
							{message.userinput}
						</div>
					{/if}

					{#if message.content}
						<div class="w-full md:w-1/2">
							<Content content="{message.content}"/>
						</div>
					{/if}

					{#if message.message}
						<div class="{message.style ? 'message-' + message.style: ''}"
						     style="{message.style === 'ac' || message.style === 'mt' || message.style === 'at'? 'color: ' +  chat.chatdef.primaryColour: '' }">
							{message.message}
						</div>
					{/if}

					{#if message.rewardicons}
						{#each message.rewardicons as icon}
							<div class="w-full md:w-1/2">
								<img src="{base}/{icon}" alt="{icon}">
							</div>
						{/each}
					{/if}
				{/if}
			{/each}

			{#if waitfor && waitfor.length > 0 }
				<div class="flex flex-col items-center px-4 pb-6">
					{#each waitfor as userInput}
						{#if isBack(userInput)}
							<button class="my-2 block py-2 px-6 flex rounded-2xl cursor-pointer"
							        on:click={() => goto(backurl)}
							        style="{chat.chatdef.primaryColour != null && chat.chatdef.secondaryColour != null? 'background: linear-gradient(90deg, ' + chat.chatdef.primaryColour + ',' + chat.chatdef.secondaryColour + ')' : 'background: ' + chat.chatdef.primaryColour}">
								Go Back
							</button>
						{:else if isFreeTextInput(userInput)}
							<input type="text" placeholder="{userInput.substring(1, userInput.length - 1)}"
							       on:change={handleTextInput} style="border-color: {chat.chatdef.primaryColour}"/>
						{:else}
							<button class="my-2 block py-2 px-6 flex rounded-2xl cursor-pointer"
							        on:click={() => handleUserInput(userInput)}
							        style="{chat.chatdef.primaryColour != null && chat.chatdef.secondaryColour != null? 'background: linear-gradient(90deg, ' + chat.chatdef.primaryColour + ',' + chat.chatdef.secondaryColour + ')' : 'background: ' + chat.chatdef.primaryColour}">
								{userInput}
							</button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
