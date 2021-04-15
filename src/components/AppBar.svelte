<script>
	export let title;
	export let backpage;
</script>

<div class="h-16">
	<div class="w-full text-2xl text-white fixed" style="background: url('/backdrop.jpg') fixed;">
		{#if backpage}
			<a href="{backpage}" class="p-4 absolute"><img src="arrow_left.svg" width="24" height="24" alt="Back"/></a>
		{/if}

		<div class="flex justify-center py-4 px-8">
			<slot></slot>
		</div>
	</div>
</div>
