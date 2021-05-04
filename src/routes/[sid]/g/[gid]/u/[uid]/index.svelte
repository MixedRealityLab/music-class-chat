<script context="module" lang="ts">
	import type {Preload} from "@sapper/common";
	import type * as t from '../../../../../../_types';

	export const preload: Preload = async function (this, page, session) {
		const {sid, gid, uid} = page.params;
		const res = await this.fetch(`api/user/${sid}/g/${gid}/u/${uid}`);
		if (res.status !== 200) {
			return {error: `Sorry, there was a problem (${res.status})`};
		}
		const data = await res.json() as t.GenericResponse;
		if (data.error) {
			return {error: data.error}
		} else {
			return {user: data as t.UUser}
		}
	}
</script>
<script lang="ts">
	import AppBar from '../../../../../../components/AppBar.svelte';
	import UserTabs from '../../../../../../components/UserTabs.svelte';
	import {stores} from '@sapper/app';

	const {page} = stores()
	const {sid, gid, uid} = $page.params
	export let error: string
	export let user: t.UUser
</script>

<AppBar title="{user ? user.group.name : 'Error'}">
	<UserTabs url="{sid}/g/{gid}/u/{uid}" page="chats"/>
</AppBar>
<div class="p-8 pt-24">

	{#if error}
		<p>ERROR: {error}</p>
	{:else}

		<div class="flex flex-col max-w-3xl mx-auto">
			{#if user.group.site.logo}
				<img class="px-4 pb-8 max-w-sm self-center" src="{user.group.site.logo}" alt="Logo">
			{/if}
			{#each user.chats as uc}
				{#if uc.enabled}
					<a href="{user.group.site._id}/g/{user.group.id}/u/{user.usercode}/c/{uc.chatdef.id}/"
					   class="mt-3 block w-full py-3 px-6 flex items-center rounded-2xl text-white"
					   style="{uc.chatdef.secondaryColour != null && uc.chatdef.primaryColour != null? 'background: linear-gradient(90deg, ' + uc.chatdef.primaryColour + ',' + uc.chatdef.secondaryColour + ')' : 'background: ' + uc.chatdef.primaryColour}">
						<h2>{uc.chatdef.name}</h2>
						<p class="pl-2 flex-1">{uc.chatdef.description ? uc.chatdef.description : ''}</p>
						{#if uc.chatdef.icon != null && uc.chatdef.icon !== ''}
							<img src="{uc.chatdef.icon}" class="max-h-4 max-w-4" alt="Chat Icon">
						{/if}
					</a>
				{:else}
					<div class="mt-3 block w-full py-3 px-6 flex items-center rounded-2xl text-white filter brightness-50"
					     style="{uc.chatdef.secondaryColour != null? 'background: linear-gradient(90deg, ' + uc.chatdef.primaryColour + ',' + uc.chatdef.secondaryColour + ')' : 'background: ' + uc.chatdef.primaryColour}">
						<h2>{uc.chatdef.name}</h2>
						<p class="pl-2 flex-1">{uc.chatdef.description ? uc.chatdef.description : ''}</p>
						{#if uc.chatdef.icon != null && uc.chatdef.icon !== ''}
							<img src="{uc.chatdef.icon}" class="max-h-4 max-w-4" alt="Chat Icon">
						{/if}
					</div>
				{/if}
			{/each}
		</div>

	{/if}

</div>
