<script type="ts">
	import {assets, base} from '$app/paths'

	let email = ""
	let password = ""
	let status: string = null
	let working = false

	async function handleSubmit() {
		working = true
		const formData = new FormData()
		formData.append("email", email)
		formData.append("password", password)
		console.log(`document.baseURI = ${document.baseURI}`)
		const response = await fetch(base + '/api/admin/login', {
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
	<img alt="Logo" class="px-4 pb-8 max-w-sm" src="{assets}/logo.png">
	<label class="block">
		<span>Admin Email</span>
		<input bind:value="{email}" class="mt-1 block w-full" disabled={working} name="email"
		       required type="email"/>
	</label>
	<label class="block pt-3">
		<span>Password</span>
		<input bind:value="{password}" class="mt-1 block w-full" disabled={working} name="password"
		       required type="password"/>
	</label>

	<div class="px-8 pt-4">
		<input class="mt-1 w-full px-4 py-2 block text-white" disabled={working || !email || !password}
		       type='submit' value='Login' style="background: #1796d8">
	</div>
	{#if status}
		<p>{status}</p>
	{/if}
</form>

