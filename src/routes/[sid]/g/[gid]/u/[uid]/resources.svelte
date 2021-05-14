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
			return {error: data.error};
		} else {
			return {user: data as t.UUser};
		}
	}
</script>
<script lang="ts">
	import AppBar from '../../../../../../components/AppBar.svelte';
	import Content from '../../../../../../components/Content.svelte';
	import UserTabs from '../../../../../../components/UserTabs.svelte';
	import {stores} from '@sapper/app';

	const {page} = stores();
	const {sid, gid, uid} = $page.params;
	export let error: string;
	export let user: t.UUser;
</script>


<AppBar title="{user ? user.group.name : 'Error'}">
	<UserTabs url="{sid}/g/{gid}/u/{uid}" page="resources"/>
</AppBar>
<div class="px-2 pt-20">
	{#if error}
		<p>ERROR: {error}</p>
	{:else}
		<div class="max-w-3xl mx-auto grid grid-cols-2 gap-2">
			{#each user.content as content, ix}
				{#if content.section && (ix === 0 || user.content[ix - 1].section !== content.section) }
					<div class="pt-2 text-lg">{content.section}</div>
				{/if}
				<Content content="{content}"/>
			{/each}
		</div>
	{/if}
</div>
