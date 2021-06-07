<script type="ts">
	import {stores} from '@sapper/app';
	import AppBar from "../../../../components/AppBar.svelte";

	const {page} = stores()
	const {sid, gid, uid} = $page.params

	let statusCode: number = null
	let working = false
	let message: string

	async function sendMessage() {
		working = true
		statusCode = null
		const formData = new FormData()
		formData.append('message', message)
		const response = await fetch(`api/admin/${sid}/g/${gid}/all/sendMessage`, {
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

	function isBlank(str) {
		return (!str || /^\s*$/.test(str))
	}
</script>

<AppBar backpage="{`${sid}/admin/${gid}`}"><h1>All Users</h1></AppBar>
<div class="px-2 pt-20 max-w-3xl mx-auto flex flex-col">
	<textarea bind:value={message} placeholder="Message" class="text-black"></textarea>
	<button on:click={sendMessage} disabled={isBlank(message) || working} class="self-end px-4 py-2 mt-2" style="background: #1796d8">Send Message</button>
</div>