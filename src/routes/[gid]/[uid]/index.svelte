<script context="module" lang="ts">
	import {assets, base} from '$app/paths'
	import type {GenericResponse, UUser} from "$lib/types";
	import type {LoadInput, LoadOutput} from "@sveltejs/kit"

	// HACK: Disable server-side rendering for now, can't cope with a base path
	export const ssr = false;

	export async function load({fetch, page}: LoadInput): Promise<LoadOutput> {
		const {gid, uid} = page.params;
		const res = await fetch(`${base}/api/user/${gid}/${uid}`)
		if (!res.ok) {
			return {status: res.status, error: res.statusText};
		}
		const data = await res.json() as GenericResponse
		if (data.error) {
			return {error: data.error}
		} else {
			return {props: {user: data as UUser}}
		}
	}
</script>
<script lang="ts">
	import AppBar from '$lib/components/AppBar.svelte';
	import UserTabs from '$lib/components/UserTabs.svelte';
	import {page} from '$app/stores'

	const {gid, uid} = $page.params
	export let error: string
	export let user: UUser
</script>

<AppBar>
	<UserTabs page="chats" url="{base}/{gid}/{uid}"
	          unread="{user.messages && user.messages.some((message) => !message.read)}"/>
</AppBar>
<div class="p-8 pt-24">

	{#if error}
		<p>ERROR: {error}</p>
	{:else}

		<div class="flex flex-col max-w-3xl mx-auto">
			<img class="px-4 pb-8 max-w-xs self-center" src="{assets}/logo.png" alt="Logo">
			{#each user.chats.sort((a, b) => a.chatdef.sortorder - b.chatdef.sortorder) as uc}
				{#if uc.enabled}
					<a href="{base}/{gid}/{uid}/c/{uc.chatdef.id}/"
					   class="mt-3 block w-full py-3 px-6 flex items-center rounded-2xl text-white"
					   style="{uc.chatdef.secondaryColour != null && uc.chatdef.primaryColour != null? 'background: linear-gradient(90deg, ' + uc.chatdef.primaryColour + ',' + uc.chatdef.secondaryColour + ')' : 'background: ' + uc.chatdef.primaryColour}">
						<h2>{uc.chatdef.name}</h2>
						<p class="pl-2 flex-1">{uc.chatdef.description ? uc.chatdef.description : ''}</p>
						{#if uc.chatdef.icon != null && uc.chatdef.icon !== ''}
							<img src="{assets}/{uc.chatdef.icon}" class="max-h-4 max-w-4" alt="Chat Icon">
						{/if}
					</a>
				{:else}
					<div class="mt-3 block w-full py-3 px-6 flex items-center rounded-2xl text-white filter brightness-50"
					     style="{uc.chatdef.secondaryColour != null? 'background: linear-gradient(90deg, ' + uc.chatdef.primaryColour + ',' + uc.chatdef.secondaryColour + ')' : 'background: ' + uc.chatdef.primaryColour}">
						<h2>{uc.chatdef.name}</h2>
						<p class="pl-2 flex-1">{uc.chatdef.description ? uc.chatdef.description : ''}</p>
						{#if uc.chatdef.icon != null && uc.chatdef.icon !== ''}
							<img src="{assets}/{uc.chatdef.icon}" class="max-h-4 max-w-4" alt="Chat Icon">
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
