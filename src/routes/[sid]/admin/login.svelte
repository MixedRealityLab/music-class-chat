<script type="ts">
	import {stores} from '@sapper/app'

	const {page} = stores()
	const {sid} = $page.params
	let email = ""
	let password = ""
	let status: String = null
	let working = false

	async function handleSubmit() {
		working = true
		const formData = new FormData()
		formData.append("email", email)
		formData.append("password", password)
		console.log(`document.baseURI = ${document.baseURI}`)
		const response = await fetch(`api/admin/${sid}/login`, {
			method: "POST",
			body: formData
		});
		const data = await response.json()
		if (response.status == 200) {
			status = "Check your email for a login link"
		} else {
			status = data.message
			working = false
		}
	}
</script>

<form class="p-4 flex flex-col items-center" on:submit|preventDefault={handleSubmit}>
	<img class="px-4 pb-8 max-w-sm" src="logo.png" alt="Logo">
	<label class="block">
		<span>Admin Email</span>
		<input disabled={working} class="mt-1 block w-full" required type="email" name="email"
		       bind:value="{email}"/>
	</label>
	<label class="block pt-3">
		<span>Password</span>
		<input disabled={working} class="mt-1 block w-full" required type="password" name="password"
		       bind:value="{password}"/>
	</label>

	<div class="px-8 pt-4">
		<input disabled={working} class="mt-1 w-full px-4 py-2 block bg-gray-300" type='submit' value='Login'>
	</div>
	{#if status}
		<p>{status}</p>
	{/if}
</form>

