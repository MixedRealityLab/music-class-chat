<script type="ts">
	import {stores} from '@sapper/app';

	const {page, session} = stores()
	const {sid, gid} = $page.params
	const {sessionid} = $session
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

<h1>Update Group</h1>

<div class="px-2">
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

