<script context="module" lang="ts">
	import type {Preload} from "@sapper/common"

	export const preload: Preload = async function (this, page) {
		const {gid} = page.params

		const res = await this.fetch(`api/admin/${gid}`)
		if (res.status === 401) {
			return this.redirect(302, `admin/login`)
		} else if (res.status !== 200) {
			return {error: `http response ${res.status}`}
		}
		const data = await res.json()
		if (data.error) {
			return {error: data.error}
		} else {
			return data
		}
	}
</script>


<script type="ts">
	import {stores} from '@sapper/app'
	import AdminTabs from "../../../components/AdminTabs.svelte"
	import AppBar from "../../../components/AppBar.svelte"
	import type {AFile} from "../../../_types"

	const {page} = stores()
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
		console.log(uploads)
		for (let i = 0; i < uploads.length; i++) {
			formData.append("files", uploads[i])
		}
		const response = await fetch(`api/admin/${gid}/upload`, {
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
		const response = await fetch(`api/admin/${gid}/delete`, {
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
	<AdminTabs page="files" url="admin/{gid}"/>
</AppBar>

<div class="px-4 pt-24 flex flex-col items-start max-w-3xl mx-auto">
	<h1>Files</h1>
	{#each files as file}
		<div class="flex items-center">
			<div><a href="{file.path}">{file.path}</a></div>
			<button class="ml-4 my-2" disabled="{working}" on:click={() => deleteFile(file.path)}>
				<img src="icons/trash.svg" class="p-2 w-8" alt="Delete File"/>
			</button>
		</div>
	{/each}

	<button class="py-2 px-4 mt-8 flex items-center" disabled="{working}" on:click={openSelect}
	        style="background: #1796d8">
		<img alt="" class="w-6 mr-2" src="icons/add.svg"/>
		Add Files
	</button>
	<input bind:files={uploads} bind:this={fileInput} class="hidden" multiple="multiple" on:change={change}
	       type="file"/>

	{#if statusText}
		<p>{statusText}</p>
	{/if}
</div>