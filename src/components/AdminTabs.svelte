<script>
	export let url
	export let page
</script>

<div class="w-full pt-1 pb-1 flex justify-evenly text-white text-center font-bold text-sm md:text-base">
	<a href="{url}/">
		<div class="px-3 py-1 cursor-pointer" class:text-blue-400="{page=='users'}">Users</div>
	</a>
	<a href="{url}/files">
		<div class="px-3 py-1 cursor-pointer" class:text-blue-400="{page=='files'}">Files</div>
	</a>
	<a href="{url}/update">
		<div class="px-3 py-1 cursor-pointer" class:text-blue-400="{page=='update'}">Update</div>
	</a>
</div>

