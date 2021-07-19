<script context="module" lang="ts">
	import {assets, base} from '$app/paths'
	import type {LoadInput, LoadOutput} from "@sveltejs/kit"

	export async function load({page, fetch}: LoadInput): Promise<LoadOutput> {
		const {gid} = page.params

		const res = await fetch(`${base}/api/admin/${gid}`)
		console.log(res)
		if (res.status === 401) {
			return {status: 302, redirect: base + '/admin/login'}
		} else if (res.status === 404) {
			return {status: 302, redirect: base + '/admin'}
		} else if (res.status !== 200) {
			return {error: `http response ${res.status}`}
		}
		const data = await res.json()

		console.log(data)
		if (data.error) {
			return {error: data.error}
		} else {
			return {props: data}
		}
	}
</script>

<script type="ts">
	import {page} from '$app/stores';
	import AdminTabs from "$lib/components/AdminTabs.svelte";
	import AppBar from "$lib/components/AppBar.svelte";
	import type {AUser} from "$lib/types";

	const {gid} = $page.params

	export let users: AUser[]
</script>

<AppBar>
	<AdminTabs page="users" url="{base}/admin/{gid}"/>
</AppBar>

<div class="px-4 pt-24 flex flex-col max-w-3xl mx-auto">
	<img alt="Logo" class="px-4 pb-8 max-w-xs self-center" src="{assets}/logo.png">

	{#if users && users.length > 0}
		<h1>Users</h1>
		<div><a href="{base}/admin/{gid}/all">All Users</a></div>

		{#each users as user}
			<div><a href="{base}/admin/{gid}/{user.usercode}">{user.initials}</a></div>
		{/each}
	{:else}
		<h1>No Users</h1>
	{/if}
</div>