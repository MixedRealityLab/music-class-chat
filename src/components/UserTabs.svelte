<script>
	export let url
	export let page
	export let unread = false
</script>

<style>
    .pip {
        @apply absolute right-0 top-0 w-2 h-2 m-1 bg-red-600 rounded-2xl
    }
</style>

<div class="w-full pt-1 pb-1 flex justify-evenly text-white text-center font-bold text-sm md:text-base">
	<a href="{url}/">
		<div class="px-3 py-2 cursor-pointer" class:text-blue-400="{page=='chats'}">Explore</div>
	</a>
	<a href="{url}/rewards">
		<div class="px-3 py-2 cursor-pointer" class:text-blue-400="{page=='rewards'}">Rewards</div>
	</a>
	<a href="{url}/resources">
		<div class="px-3 py-2 cursor-pointer" class:text-blue-400="{page=='resources'}">Resources</div>
	</a>
	<a href="{url}/messages" class="relative">
		<div class="px-3 py-2 cursor-pointer" class:text-blue-400="{page=='settings'}">Notifications</div>
		{#if unread}
			<div class="pip"></div>
		{/if}
	</a>
</div>

