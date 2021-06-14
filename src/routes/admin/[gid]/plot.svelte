<svelte:head>
	<title>Event Plot</title>
	<script src="https://cdn.plot.ly/plotly-2.0.0-rc.3.min.js"></script>
</svelte:head>

<div class="w-full h-screen flex flex-col">
	<div id='plotDiv' class="w-full" style="height: 800px" bind:this={plot}></div>
</div>

<script>
	import {onMount} from "svelte";
	import {stores} from '@sapper/app';

	const {page} = stores()
	const {gid} = $page.params

	let plot;

	onMount(async () => {
		const res = await fetch(`/api/admin/${gid}/plot`)
		if(res.ok) {
			const data = await res.json()
			Plotly.newPlot(plot, data, {}, {responsive: true})
		}
	})
</script>
