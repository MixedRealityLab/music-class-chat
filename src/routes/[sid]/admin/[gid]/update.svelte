<script type="ts">
	import {stores} from '@sapper/app';
	import AdminTabs from "../../../../components/AdminTabs.svelte";
	import AppBar from "../../../../components/AppBar.svelte";

	const {page, session} = stores()
	const {sid, gid} = $page.params

	let spreadsheet: FileList
	let fileInput: HTMLInputElement
	let statusCode: number = null
	let working = false

	if (spreadsheet != null && spreadsheet.length > 0) {
		submitUpdate()
	}

	async function submitUpdate() {
		if (spreadsheet.length > 0) {
			working = true;
			const formData = new FormData();
			formData.append("spreadsheet", spreadsheet[0]);
			console.log(`document.baseURI = ${document.baseURI}`);
			const response = await fetch(`api/admin/${sid}/g/${gid}/update`, {
				method: "POST",
				body: formData
			});
			statusCode = response.status;
			working = false;
		}
	}

	async function openSelect() {
		fileInput.click()
	}
</script>

<AppBar>
	<AdminTabs page="update" url="{sid}/admin/{gid}"/>
</AppBar>

<div class="px-4 pt-24 flex flex-col items-start max-w-3xl mx-auto">
	<h1>Update Group</h1>
	<button class="py-2 px-4 mt-8 flex items-center" disabled="{working}" on:click={openSelect}>
		<img alt="" class="w-6 mr-2" src="icons/upload.svg"/>
		Upload Spreadsheet
	</button>
	<input accept=".xslx" bind:files={spreadsheet} bind:this={fileInput} class="hidden" id="spreadsheet"
	       required type="file"/>

	{#if statusCode}
		<p>Status: {statusCode}</p>
	{/if}
</div>