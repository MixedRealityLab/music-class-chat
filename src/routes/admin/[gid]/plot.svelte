<script lang="ts">
	import {base} from '$app/paths'
	import {page} from '$app/stores';
	import type Plotly from 'plotly.js'
	import {onMount} from "svelte";

	const {gid} = $page.params

	onMount(async () => {
		const res = await fetch(`${base}/api/admin/${gid}/plot`)
		if (res.status === 401) {
			return {status: 302, redirect: base + '/admin/login'}
		} else if (res.ok) {
			const data = await res.json()
			await Plotly.newPlot('plot', data, {}, {
				responsive: true,
				modeBarButtonsToRemove: ['lasso2d', 'zoomIn2d', 'zoomOut2d', 'toggleSpikelines', 'resetScale2d'],
				toImageButtonOptions: {
					format: 'png', // one of png, svg, jpeg, webp
					filename: 'drinks',
					height: 1080,
					width: 1920,
					scale: 1
				},
				displaylogo: false,
				scrollZoom: true
			});
		}
	})
</script>

<svelte:head>
	<script src="https://cdn.plot.ly/plotly-2.2.1.min.js"></script>
	<style>
        svg.main-svg {
            @apply absolute top-0 left-0 right-0 border-0 pointer-events-none;
        }

        .modebar {
            @apply flex top-0 right-0 justify-end p-4;
        }

        .modebar-btn {
            @apply p-1;
        }

        .modebar-group {
            @apply p-1;
            display: flex !important;
        }
	</style>
</svelte:head>

<div id="plot" class="w-full" style="height: 800px"></div>