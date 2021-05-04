<script>
	export let backpage;
</script>

<div class="h-16 w-full text-white fixed z-10 bg-black">
	{#if backpage}
		<a href="{backpage}" class="p-4 absolute"><img src="arrow_left.svg" width="24" height="24" alt="Back"/></a>
	{/if}

	<div class="flex justify-center py-4 px-8">
		<slot></slot>
	</div>
</div>