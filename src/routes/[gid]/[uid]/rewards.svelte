<script context="module" lang="ts">
	import {assets, base} from '$app/paths'
	import type {GenericResponse, UUser} from "$lib/types";
	import type {LoadInput, LoadOutput} from "@sveltejs/kit"

	export async function load({fetch, page}: LoadInput): Promise<LoadOutput> {
		const {gid, uid} = page.params
		const res = await fetch(`${base}/api/user/${gid}/${uid}`)
		if (res.status !== 200) {
			return {error: `Sorry, there was a problem (${res.status})`}
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

	const {gid, uid} = $page.params;
	export let error: string;
	export let user: UUser;
</script>


<svelte:head>
	<title>{user.group.name} Rewards</title>
</svelte:head>

<AppBar>
	<UserTabs page="rewards" url="{base}/{gid}/{uid}"
	          unread="{user.messages && user.messages.some((message) => !message.read)}"/>
</AppBar>
<div class="px-2 pt-20">
	{#if error}
		<p>ERROR: {error}</p>
	{:else}
		<div class="max-w-3xl mx-auto grid grid-cols-2 gap-6">
			{#each user.rewards as reward}
				{#if (reward.got && reward.icon) || (!reward.got && reward.noicon)}
					<img src="{assets}/{reward.got ? reward.icon : reward.noicon}" alt="reward {reward._id}">
				{/if}
			{/each}
		</div>
	{/if}
</div>
