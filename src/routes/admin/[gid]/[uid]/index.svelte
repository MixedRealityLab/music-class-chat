<script context="module" lang="ts">
	import {assets, base} from '$app/paths'
	import type {AUser} from "$lib/types";
	import type {LoadInput, LoadOutput} from "@sveltejs/kit"

	export async function load({page, fetch}: LoadInput): Promise<LoadOutput> {

		const {gid, uid} = page.params

		const res = await fetch(`${base}/api/admin/${gid}/${uid}`)
		if (res.status === 401) {
			return this.redirect(302, `admin/login`)
		} else if (res.status !== 200) {
			return {error: `http response ${res.status}`};
		}
		const data = await res.json()
		if (data.error) {
			return {error: data.error};
		} else {
			return {props: {user: data as AUser}}
		}
	}
</script>


<script type="ts">
	import {page} from '$app/stores';
	import AppBar from "$lib/components/AppBar.svelte";

	const {gid, uid} = $page.params

	export let user: AUser
	let statusCode: number = null
	let working = false
	let message: string

	async function sendMessage() {
		working = true
		statusCode = null
		const formData = new FormData()
		formData.append('message', message)
		const response = await fetch(`${base}/api/admin/${gid}/${uid}/sendMessage`, {
			method: "POST",
			body: formData
		})
		if (response.ok) {
			//files = await response.json()
		} else {
			statusCode = response.status
		}
		message = ''
		working = false
	}

	async function copyUserLink() {
		await navigator.clipboard.writeText(new URL(`${base}/${gid}/${uid}`, document.baseURI).href)
	}

	function isBlank(str: string): boolean {
		return (!str || /^\s*$/.test(str))
	}
</script>


<AppBar backpage="{base}/admin/{gid}"><h1>{user ? user.initials : ''}</h1></AppBar>
<div class="px-2 pt-20 max-w-3xl mx-auto flex flex-col">
	<button on:click={copyUserLink} class="self-start px-4 py-2 my-4" style="background: #1796d8">Copy User Login Link
		to Clipboard
	</button>


	<textarea bind:value={message} placeholder="Message" class="text-black"></textarea>
	<button on:click={sendMessage} disabled={isBlank(message) || working} class="self-end px-4 py-2 mt-2"
	        style="background: #1796d8">Send Message
	</button>
	<h1>Rewards</h1>
	<div class="grid grid-cols-3 gap-2">
		{#each user.rewards as reward}
			{#if (reward.got && reward.icon) || (!reward.got && reward.noicon)}
				<img src="{assets}/{reward.got ? reward.icon : reward.noicon}" alt="reward {reward._id}">
			{/if}
		{/each}
	</div>
</div>