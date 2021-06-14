<script context="module" lang="ts">
	import type {Preload} from "@sapper/common";
	import type {GenericResponse, UUser} from "../../../_types";

	export const preload: Preload = async function (this, page) {
		const {gid, uid} = page.params;
		const res = await this.fetch(`api/user/${gid}/${uid}`);
		if (res.status !== 200) {
			return {error: `Sorry, there was a problem (${res.status})`};
		}
		const data = await res.json() as GenericResponse;
		if (data.error) {
			return {error: data.error};
		} else {
			return {user: data as UUser};
		}
	}
</script>
<script lang="ts">
	import type {UUser} from "../../../_types";
	import AppBar from '../../../components/AppBar.svelte';
	import UserTabs from '../../../components/UserTabs.svelte';
	import {stores} from '@sapper/app';

	const {page} = stores()
	const {gid, uid} = $page.params
	export let error: string
	export let user: UUser

	if (user && user.messages && user.messages.some((message) => !message.read)) {
		markRead()
	}

	async function markRead() {
		const formData = new FormData()
		formData.append('timestamp', user.messages[user.messages.length - 1].timestamp)
		await fetch(`api/user/${gid}/${uid}/markRead`, {
			method: "POST",
			body: formData
		})
	}
</script>

<AppBar>
	<UserTabs page="messages" url="{gid}/{uid}"
	          unread="{user.messages && user.messages.some((message) => !message.read)}"/>
</AppBar>
<div class="px-2 pt-20">
	{#if error}
		<p>ERROR: {error}</p>
	{:else}
		<div class="max-w-3xl mx-auto flex flex-col">
			{#if user.messages}
				{#each user.messages as message}
					<div class="mb-6 mt-2 block py-2 px-6 flex flex-col text-gray-300">
						<div class:font-bold={!message.read} class="whitespace-pre-line">
							{message.text}
						</div>
						<div class="text-xs">
							{new Date(Date.parse(message.timestamp)).toLocaleString("en-GB", {
								hour: 'numeric',
								minute: 'numeric',
								day: 'numeric',
								month: 'short',
								year: 'numeric',
							})}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}

</div>
