<script type="ts">
	import {stores} from '@sapper/app'
	import AppBar from "../../../components/AppBar.svelte"

	const {page} = stores()
	const {sid} = $page.params
	let email = ""
	let password = ""
	let statusCode: number = null
	let working = false

	async function handleSubmit() {
		working = true
		const formData = new FormData()
		formData.append("email", email)
		formData.append("password", password)
		console.log(`document.baseURI = ${document.baseURI}`)
		const response = await fetch(`api/admin/${sid}/session`, {
			method: "POST",
			body: formData
		});
		statusCode = response.status;
		working = false
	}
</script>

<AppBar title="Admin Login"/>

<form class="p-4" on:submit|preventDefault={handleSubmit}>
	<div class="max-w-6xl">
		<label class="block">
			<span>Admin Email</span>
			<input class="mt-1 block w-full" required type="email" name="email" bind:value="{email}"/>
		</label>
		<label class="block">
			<span>Password</span>
			<input class="mt-1 block w-full" required type="password" name="password" bind:value="{password}"/>
		</label>

		<div class="px-8">
			<input disabled={working} class="mt-1 w-full px-4 py-2 block bg-gray-300" type='submit' value='Login'>
		</div>
		{#if statusCode}
			<p>Status: {statusCode}</p>
		{/if}
	</div>
</form>

