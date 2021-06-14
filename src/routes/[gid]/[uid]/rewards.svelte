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
	import AppBar from '../../../components/AppBar.svelte';
	import UserTabs from '../../../components/UserTabs.svelte';
	import {stores} from '@sapper/app';

	const {page} = stores();
	const {gid, uid} = $page.params;
	export let error: string;
	export let user: UUser;
</script>

<AppBar>
	<UserTabs page="rewards" url="{gid}/{uid}" unread="{user.messages && user.messages.some((message) => !message.read)}"/>
</AppBar>
<div class="px-2 pt-20">
	{#if error}
		<p>ERROR: {error}</p>
	{:else}
		<div class="max-w-3xl mx-auto grid grid-cols-2 gap-6">
			{#each user.rewards as reward}
				{#if (reward.got && reward.icon) || (!reward.got && reward.noicon)}
					<img src="{reward.got ? reward.icon : reward.noicon}" alt="reward {reward._id}">
				{/if}
			{/each}
		</div>
	{/if}
</div>
