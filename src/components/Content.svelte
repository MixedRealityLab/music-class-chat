<script>
  import {ContentType} from '../_types';
  export let content;
</script>

<div class="mt-1 block w-full bg-gray-300 p-2">
  {#if content.type == ContentType.image}
    <img src="{content.url}" alt="{content.title}">
  {:else if content.type == ContentType.youtube}
    <iframe title="{content.title}" 
     src="{content.url.indexOf('/embed/')<0 ? 'https://youtube.com/embed/'+content.url.substring(content.url.lastIndexOf('/')) : content.url}"
     frameborder="0" allow="encrypted-media; picture-in-picture" 
     allowfullscreen></iframe>
  {:else if content.type == ContentType.mp3}
    <!-- svelte-ignore a11y-media-has-caption -->
    <audio controls>
      <source src="{content.url}" type="audio/mp3">
    </audio>
  {:else if content.type == ContentType.document || content.type == ContentType.website}
    <p>{content.type==ContentType.document ? 'Document' : 'Website'}:</p>
    <a href="{content.url}" class="cursor-pointer" target="_blank">
      <div class="bg-gray-100 p-2">
        <p class="text-lg">{content.title}</p>
        <p class="">{content.description}</p>
      </div>
    </a>
  {:else}
    <p>Unknown content ({content.type}): {content.title})</p>
  {/if}
</div>
 
