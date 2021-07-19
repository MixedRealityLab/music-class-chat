<script context="module" lang="ts">
	import {assets, base} from '$app/paths'
	import type {LoadInput, LoadOutput} from "@sveltejs/kit"

	export async function load({page, fetch}: LoadInput): Promise<LoadOutput> {
		const {gid} = page.params

		const res = await fetch(`${base}/api/admin/${gid}`)
		console.log(res)
		if (res.status === 401) {
			return {status: 302, redirect: base + '/admin/login'}
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
	import {page} from '$app/stores'
	import AdminTabs from "$lib/components/AdminTabs.svelte"
	import AppBar from "$lib/components/AppBar.svelte"
	import type {AFile} from "$lib/types"
	import {toBase64} from "../../../lib/upload";

	const {gid} = $page.params

	export let files: AFile[]
	let uploads: FileList
	let fileInput: HTMLInputElement
	let statusText: string = null
	let working = false

	async function change() {
		console.log(uploads)
		if (uploads != null && uploads.length > 0) {
			await submitUpload()
		}
	}

	async function submitUpload() {
		working = true
		statusText = null
		const formData = new FormData()
		for (let i = 0; i < uploads.length; i++) {
			const file = uploads[i]
			formData.append("fileName", file.name)
			formData.append("fileType", file.type)
			formData.append("fileData", await toBase64(file))
		}
		const response = await fetch(`${base}/api/admin/${gid}/upload`, {
			method: "POST",
			body: formData
		})
		if (response.ok) {
			files = await response.json()
		} else {
			statusText = response.statusText
		}
		working = false
	}

	async function deleteFile(path: string) {
		working = true
		statusText = null
		const formData = new FormData()
		formData.append('path', path)
		const response = await fetch(`${base}/api/admin/${gid}/delete`, {
			method: "POST",
			body: formData
		})
		if (response.ok) {
			files = await response.json()
		} else {
			statusText = response.statusText
		}
		working = false
	}

	function openSelect() {
		fileInput.click()
	}
</script>

<AppBar>
	<AdminTabs page="files" url="{base}/admin/{gid}"/>
</AppBar>

<div class="px-4 pt-24 flex flex-col items-start max-w-3xl mx-auto">
	<h1>Files</h1>
	{#if files}
		{#each files as file}
			<div class="flex items-center">
				<div><a href="{assets}/{file.path}">{file.path}</a></div>
				<button class="ml-4 my-2" disabled="{working}" on:click={() => deleteFile(file.path)}>
					<img src="{assets}/icons/trash.svg" class="p-2 w-8" alt="Delete File"/>
				</button>
			</div>
		{/each}
	{/if}

	<button class="py-2 px-4 mt-8 flex items-center" disabled="{working}" on:click={openSelect}
	        style="background: #1796d8">
		<img alt="" class="w-6 mr-2" src="{assets}/icons/add.svg"/>
		Add Files
	</button>
	<input bind:files={uploads} bind:this={fileInput} class="hidden" multiple="multiple" on:change={change}
	       type="file"/>

	{#if statusText}
		<p>{statusText}</p>
	{/if}
</div>