<script>
	import {ContentType} from '../_types';
	import {DialogContent, DialogOverlay} from 'svelte-accessible-dialog';

	export let content;

	let isOpen = false;

	const open = () => {
		isOpen = true;
	};

	const close = () => {
		isOpen = false;
	};
</script>

<div class="w-full md:w-1/2">
	{#if content.type === ContentType.image}
		<img src="{content.url}" alt="{content.title}" on:click={open}>
		<DialogOverlay {isOpen} onDismiss={close}>
			<DialogContent aria-label="Definition"
			               style="background: #222; filter: drop-shadow(0 4px 8px #0008); width: 90vw; padding: 0; margin: 5rem auto auto;">
				<img src="{content.url}" style="width: 100%" alt="{content.title}" on:click={close}>
			</DialogContent>
		</DialogOverlay>
	{:else if content.type === ContentType.youtube}
		<div class="relative h-0" style="padding-bottom: 56.25%;">
			<iframe title="{content.title}" class="absolute w-full h-full"
			        src="{content.url.indexOf('/embed/')<0 ? 'https://youtube.com/embed/'+content.url.substring(content.url.lastIndexOf('/')) : content.url}"
			        frameborder="0" allow="encrypted-media; picture-in-picture"
			        allowfullscreen></iframe>
		</div>
	{:else if content.type === ContentType.mp3}
		<!-- svelte-ignore a11y-media-has-caption -->
		<audio controls>
			<source src="{content.url}" type="audio/mp3">
		</audio>
	{:else if content.type === ContentType.document || content.type === ContentType.website}
		<p>{content.type === ContentType.document ? 'Document' : 'Website'}:</p>
		<a href="{content.url}" class="cursor-pointer" target="_blank">
			<div class="bg-gray-100 p-2 rounded-2xl">
				<p class="text-lg">{content.title}</p>
				<p class="">{content.description}</p>
			</div>
		</a>
	{:else}
		<p>Unknown content ({content.type}): {content.title})</p>
	{/if}
</div>
