<script>
	import '$lib/app.postcss'
	import {assets} from '$app/paths'
</script>

<svelte:head>
	<link href="{assets}/music-class.svg" rel="icon" type="image/svg">
</svelte:head>

<main>
	<slot></slot>
</main>
