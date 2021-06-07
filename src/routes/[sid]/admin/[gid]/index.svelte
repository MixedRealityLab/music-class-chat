<script context="module" lang="ts">
	import type {Preload} from "@sapper/common"

	export const preload: Preload = async function (this, page, session) {
		const {sid, gid} = page.params

		const res = await this.fetch(`api/admin/${sid}/g/${gid}`)
		if (res.status === 401) {
			return this.redirect('302', `${sid}/admin/login`)
		} else if (res.status !== 200) {
			return {error: `http response ${res.status}`}
		}
		const data = await res.json()

		console.log(data)
		if (data.error) {
			return {error: data.error}
		} else {
			return data
		}
	}
</script>

<script type="ts">
	import {stores} from '@sapper/app';
	import AdminTabs from "../../../../components/AdminTabs.svelte";
	import AppBar from "../../../../components/AppBar.svelte";
	import type {AUser} from "../../../../_types";

	const {page} = stores()
	const {sid, gid} = $page.params

	export let users: AUser[]
</script>

<AppBar>
	<AdminTabs page="users" url="{sid}/admin/{gid}"/>
</AppBar>

<div class="px-4 pt-24 flex flex-col max-w-3xl mx-auto">
	<img alt="Logo" class="px-4 pb-8 max-w-xs self-center" src="logo.png">

	{#if users && users.length > 0}
		<h1>Users</h1>
		<div><a href="all">All Users</a></div>

		{#each users as user}
			<div><a href="{user.usercode}">{user.initials}</a></div>
		{/each}
	{:else}
		<h1>No Users</h1>
	{/if}
</div>