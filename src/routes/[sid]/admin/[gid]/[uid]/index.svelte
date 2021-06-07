<script context="module" lang="ts">
	import type {Preload} from "@sapper/common"
	import type {UUser} from "../../../../../_types"

	export const preload: Preload = async function (this, page, session) {
		const {sid, gid, uid} = page.params

		const res = await this.fetch(`/api/admin/${sid}/g/${gid}/${uid}`)
		if (res.status === 401) {
			return this.redirect('302', `/${sid}/admin/login`)
		} else if (res.status !== 200) {
			return {error: `http response ${res.status}`};
		}
		const data = await res.json()
		if (data.error) {
			return {error: data.error};
		} else {
			return {user: data as UUser};
		}
	}
</script>


<script type="ts">
	import {stores} from '@sapper/app';
	import AppBar from "../../../../../components/AppBar.svelte";

	const {page} = stores()
	const {sid, gid, uid} = $page.params

	export let user
	let statusCode: number = null
	let working = false
	let message: string

	async function sendMessage() {
		working = true
		statusCode = null
		const formData = new FormData()
		formData.append('message', message)
		const response = await fetch(`api/admin/${sid}/g/${gid}/${uid}/sendMessage`, {
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
		const url = new URL(`${sid}/g/${gid}/u/${uid}`, document.baseURI).href
		console.log(url)
		await navigator.clipboard.writeText(url)
	}

	function isBlank(str) {
		return (!str || /^\s*$/.test(str))
	}
</script>


<AppBar backpage="{`${sid}/admin/${gid}`}"><h1>{user ? user.initials : ''}</h1></AppBar>
<div class="px-2 pt-20 max-w-3xl mx-auto flex flex-col">
	<button on:click={copyUserLink} class="self-start px-4 py-2 my-4" style="background: #1796d8">Copy User Login Link to Clipboard</button>


	<textarea bind:value={message} placeholder="Message" class="text-black"></textarea>
	<button on:click={sendMessage} disabled={isBlank(message) || working} class="self-end px-4 py-2 mt-2" style="background: #1796d8">Send Message</button>
	<h1>Rewards</h1>
	<div class="grid grid-cols-3 gap-2">
		{#each user.rewards as reward}
			{#if (reward.got && reward.icon) || (!reward.got && reward.noicon)}
				<img src="{reward.got ? reward.icon : reward.noicon}" alt="reward {reward._id}">
			{/if}
		{/each}
	</div>
</div>