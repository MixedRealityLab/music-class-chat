<script context="module" lang="ts">
	import {assets, base} from '$app/paths'
	import type {UGroup} from "$lib/types";
	import type {LoadInput, LoadOutput} from "@sveltejs/kit"

	// HACK: Disable server-side rendering for now, can't cope with a base path
	export const ssr = false;

	export async function load({fetch}: LoadInput): Promise<LoadOutput> {
		const res = await fetch(base + '/api/admin/groups')
		console.log(res.status)
		if (res.status === 401) {
			return {status: 302, redirect: base + '/admin/login'}
		} else if (res.status !== 200) {
			return {error: `http response ${res.status}`};
		}
		const data = await res.json()
		if (data.error) {
			return {error: data.error};
		} else {
			return {props: {groups: data as Array<UGroup>}}
		}
	}
</script>


<script type="ts">
	import {DialogContent, DialogOverlay} from 'svelte-accessible-dialog'
	import {toBase64} from "$lib/upload";

	export let groups: Array<UGroup> = []

	let groupName = ""
	let files: FileList
	let password = ""
	let createGroup = false

	async function handleSubmit() {
		//working = true
		createGroup = false
		const formData = new FormData()
		formData.append("name", groupName)
		formData.append("password", password)
		formData.append('spreadsheet', await toBase64(files.item(0)))
		const response = await fetch(base + '/api/admin/createGroup', {
			method: "POST",
			body: formData
		});
		const data = await response.json()
		groups = data as Array<UGroup>
	}

	async function addGroup() {
		createGroup = true
	}

	async function close() {
		createGroup = false
	}
</script>

<div class="p-4 flex flex-col items-center max-w-3xl mx-auto">
	<img alt="Logo" class="px-4 pb-8 max-w-xs self-center" src="{assets}/logo.png">

	<h1>Groups</h1>

	{#each groups as group}
		<a href="{base}/admin/{group._id}">{group.name}</a>
	{/each}

	<DialogOverlay isOpen="{createGroup}" onDismiss={close}>
		<DialogContent aria-label="Definition" class="z-50 w-1/2 rounded-2xl filter shadow-2xl"
		               style="background: #333">
			<form on:submit|preventDefault={handleSubmit} class="flex flex-col">
				<label class="pt-3 flex flex-col">
					<span>Group Name</span>
					<input bind:value="{groupName}" class="mt-1" name="name" required type="text"/>
				</label>
				<label class="pt-3 flex flex-col">
					<span>Password</span>
					<input bind:value="{password}" class="mt-1" name="password" required type="password"/>
				</label>

				<label class="pt-3 flex flex-col">
					<span>Spreadsheet</span>
					<input bind:files class="mt-1 text-white" id="file" required type="file"/>
				</label>

				<input class="mt-4 w-full px-4 py-2 text-white"
				       style="background: #1796d8" type='submit' value='Create New Group'>
			</form>
		</DialogContent>
	</DialogOverlay>

	<button class="py-2 px-4 mt-8 flex items-center" on:click={addGroup}
	        style="background: #1796d8">
		<img alt="" class="w-6 mr-2" src="icons/add.svg"/>
		Add Group
	</button>
</div>
