<script type="ts">
	import {assets, base} from '$app/paths'
	import {page} from '$app/stores';
	import AdminTabs from "$lib/components/AdminTabs.svelte";
	import AppBar from "$lib/components/AppBar.svelte";
	import {toBase64} from "../../../lib/upload";

	const {gid} = $page.params

	let spreadsheet: FileList
	let fileInput: HTMLInputElement
	let statusText: string = null
	let working = false

	async function submitUpdate() {
		if (spreadsheet.length > 0) {
			working = true
			statusText = null
			const formData = new FormData();
			formData.append('spreadsheet', await toBase64(spreadsheet.item(0)))
			const response = await fetch(`${base}/api/admin/${gid}/update`, {
				method: "POST",
				body: formData
			});
			if (response.ok) {
				statusText = "Successfully Updated"
			} else {
				statusText = response.statusText
			}
			fileInput.value = ""
			working = false
		}
	}

	async function openSelect() {
		fileInput.click()
	}
</script>

<AppBar>
	<AdminTabs page="update" url="{base}/admin/{gid}"/>
</AppBar>

<div class="px-4 pt-24 flex flex-col items-start max-w-3xl mx-auto">
	<h1>Update Group</h1>
	<button class="py-2 px-4 mt-8 flex items-center" disabled="{working}" on:click={openSelect}
	        style="background: #1796d8">
		<img alt="" class="w-6 mr-2" src="{assets}/icons/upload.svg"/>
		Upload Spreadsheet
	</button>
	<input accept=".xlsx" bind:files={spreadsheet} bind:this={fileInput} on:change={submitUpdate} class="hidden"
	       id="spreadsheet"
	       required type="file"/>

	{#if statusText}
		<p>{statusText}</p>
	{/if}
</div>