<script context="module" lang="ts">
	import type {Preload} from "@sapper/common";
	import type {GenericResponse, UUser} from "../../../../../../_types";

	export const preload: Preload = async function (this, page, session) {
		const {sid, gid, uid} = page.params;
		const res = await this.fetch(`api/user/${sid}/g/${gid}/u/${uid}`);
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
	import type {UUser} from "../../../../../../_types";
	import AppBar from '../../../../../../components/AppBar.svelte';
	import UserTabs from '../../../../../../components/UserTabs.svelte';
	import {stores} from '@sapper/app';

	const {page} = stores();
	const {sid, gid, uid} = $page.params;
	export let error: string;
	export let user: UUser;
</script>

<AppBar title="{user ? user.group.name : 'Error'}">
	<UserTabs url="{sid}/g/{gid}/u/{uid}" page="settings"/>
</AppBar>
<div class="px-2 pt-20">
	{#if error}
		<p>ERROR: {error}</p>
	{:else}
		<div class="max-w-3xl mx-auto flex flex-col">
			{#if user.messages}
				{#each user.messages as message}
					{#if message.fromUser}
						<div class="mb-6 mt-2 block py-2 px-6 flex rounded-2xl text-gray-300">
							{message.text}
						</div>
					{:else}
						<div>
							{message.text}
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	{/if}
</div>
