<script>
	export let title;
	export let backpage;
</script>

<div class="w-full bg-gray-700 text-2xl text-white flex items-center">
	{#if backpage}

		<a href="{backpage}" class="p-4"><img src="arrow_left.svg" width="24" height="24" alt="Back"/></a>
	{/if}
	<div class="py-2" class:px-4={!backpage}>{title}</div>
</div>

