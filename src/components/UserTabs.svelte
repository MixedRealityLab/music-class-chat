<script>
	export let url
	export let page
</script>

<div class="w-full pt-1 pb-1 grid grid-cols-4 gap-1 text-white text-center font-bold text-sm md:text-base">
	<a href="{url}/">
		<div class="py-1 cursor-pointer" class:text-blue-400="{page=='chats'}">Explore</div>
	</a>
	<a href="{url}/rewards">
		<div class="py-1 cursor-pointer" class:text-blue-400="{page=='rewards'}">Rewards</div>
	</a>
	<a href="{url}/resources">
		<div class="py-1 cursor-pointer" class:text-blue-400="{page=='resources'}">Resources</div>
	</a>
	<a href="{url}/messages">
		<div class="py-1 cursor-pointer" class:text-blue-400="{page=='settings'}">Notifications</div>
	</a>
</div>

