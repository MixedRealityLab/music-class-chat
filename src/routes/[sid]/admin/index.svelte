<script context="module" lang="ts">
	import type {Preload} from "@sapper/common";
	import type {UGroup} from "../../../_types";

	export const preload: Preload = async function (this, page, session) {
		const {sid} = page.params

		const res = await this.fetch(`/api/admin/${sid}/groups`)
		console.log(res.status)
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

	const {page} = stores()
	const {sid} = $page.params


	export let groups: Array<UGroup> = []
	let groupName: string
	let files
	let password: string

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
</script>

<h1>Groups</h1>

{#each groups as group}
	<a href="/${sid}/admin/${group.id}">{group.name}</a>
{/each}

<form class="p-4" on:submit|preventDefault={handleSubmit}>
	<div class="max-w-6xl">
		<label class="block">
			<span>Group Name</span>
			<input class="mt-1 block w-full" required type="text" name="name"
			       bind:value="{groupName}"/>
		</label>
		<label class="block">
			<span>Password</span>
			<input class="mt-1 block w-full" required type="password" name="password"
			       bind:value="{password}"/>
		</label>

		<label class="block">
			<span>Spreadsheet (file):</span>
			<input class="mt-1 block w-full" required id="file" type="file" bind:files/>
		</label>


		<div class="px-8">
			<input class="mt-1 w-full px-4 py-2 block bg-gray-300" type='submit' value='Create Group'>
		</div>
	</div>
</form>

