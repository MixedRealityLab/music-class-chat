<script context="module" lang="ts">
	import type {Preload} from "@sapper/common";
	import type {UGroup} from "../../../_types";

	export const preload: Preload = async function (this, page, session) {
		const {sid} = page.params

		const res = await this.fetch(`/api/admin/${sid}/groups`)
		if (res.status === 401) {
			return this.redirect('302', `/${sid}/admin/login`)
		} else if (res.status !== 200) {
			return {error: `http response ${res.status}`};
		}
		const data = await res.json()
		if (data.error) {
			return {error: data.error};
		} else {
			return {groups: data as Array<UGroup>};
		}
	}
</script>


<script type="ts">
	import {stores} from "@sapper/app";
	import {slide} from 'svelte/transition';

	const {page} = stores()
	const {sid} = $page.params

	export let groups: Array<UGroup> = []
	let groupName: string
	let files
	let password: string
	let createGroup = false

	async function handleSubmit() {
		//working = true
		const formData = new FormData()
		formData.append("name", groupName)
		formData.append("password", password)
		formData.append("spreadsheet", files[0])
		console.log(`document.baseURI = ${document.baseURI}`)
		const response = await fetch(`api/admin/${sid}/createGroup`, {
			method: "POST",
			body: formData
		});
		const data = await response.json()
		// if (response.status == 200) {
		// 	status = "Check your email for a login link"
		// } else {
		// 	status = data.message
		// }
	}

	async function addGroup() {
		console.log("add group")
		createGroup = true
	}
</script>

<div class="p-4 flex flex-col items-center">
	<h1>Groups</h1>

	{#each groups as group}
		<a href="/${sid}/admin/${group.id}">{group.name}</a>
	{/each}

	{#if createGroup}
		<form transition:slide on:submit|preventDefault={handleSubmit}>
			<label class="block pt-3">
				<span>Group Name</span>
				<input class="mt-1 block w-full" required type="text" name="name"
				       bind:value="{groupName}"/>
			</label>
			<label class="block pt-3">
				<span>Password</span>
				<input class="mt-1 block w-full" required type="password" name="password"
				       bind:value="{password}"/>
			</label>

			<label class="block pt-3">
				<span>Spreadsheet</span>
				<input class="mt-1 block w-full text-white" required id="file" type="file" bind:files/>
			</label>

			<input class="mt-4 w-full px-4 py-2 block bg-gray-300" type='submit' value='Create New Group'>
		</form>
	{:else}
		<button on:click={addGroup}>Add Group</button>
	{/if}
</div>
