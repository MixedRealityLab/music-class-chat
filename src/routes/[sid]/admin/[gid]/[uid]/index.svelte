<script context="module" lang="ts">
	import type {Preload} from "@sapper/common"
	import type {UUser} from "../../../../../_types"

	export const preload: Preload = async function (this, page, session) {
		const {sid, gid, uid} = page.params

		const res = await this.fetch(`/api/admin/${sid}/g/${gid}`)
		if (res.status === 401) {
			return this.redirect('302', `/${sid}/admin/login`)
		} else if (res.status !== 200) {
			return {error: `http response ${res.status}`};
		}
		const data = await res.json()
		if (data.error) {
			return {error: data.error};
		} else {
			return {users: data as Array<UUser>};
		}
	}
</script>


<script type="ts">
	import {stores} from '@sapper/app';

	const {page, session} = stores()
	const {sid, gid} = $page.params
	const {sessionid} = $session

	export let users
	let files
	let statusCode: number = null
	let working = false

	async function handleSubmit() {
		if (files.length > 0) {
			working = true;
			const formData = new FormData();
			formData.append("spreadsheet", files[0]);
			console.log(`document.baseURI = ${document.baseURI}`);
			const response = await fetch(`api/admin/${sid}/g/${gid}/update`, {
				method: "POST",
				body: formData
			});
			statusCode = response.status;
			working = false;
		}
	}
</script>

<div class="px-4">
	<h1>Users</h1>
	<div>
		{#each users as user}
			<a href="/{sid}/admin/{gid}/{user.id}">{user.initials}</a>
		{/each}
	</div>

	<h1>Update Group</h1>
	<!-- TODO List Users -->
	<form on:submit|preventDefault={handleSubmit}>
		<div class="grid grid-cols-1 gap-2">
			<label class="block">
				<span>Spreadsheet (file):</span>
				<input class="mt-1 block w-full" required id="file" type="file" bind:files/>
			</label>
			<input disabled={working} class="mt-1 block w-full bg-gray-300 py-2" type='submit' value='Update'>
		</div>
	</form>

	{#if statusCode}
		<p>Status: {statusCode}</p>
	{/if}
</div>