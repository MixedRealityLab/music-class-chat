<script context="module" lang="ts">
  import type { Preload } from "@sapper/common";
  import type * as t from '../../../../_types';
  export const preload:Preload = async function(this, page, session) {
    const { sid, gid } = page.params;
    //console.log(`page`,page);
    const res = await this.fetch(`api/user/${sid}/g/${gid}`);
    if (res.status !== 200) {
      return { error: `http response ${res.status}` };
    } 
    const data = await res.json() as t.GenericResponse;
    if (data.error) {
      return { error: data.error };
    } else {
      return { group: data as t.UGroup };
    }
  }
</script>
<script lang="ts">
  export let error: string;
  export let group: t.UGroup;
</script>

<h1>Music Class Chat</h1>

{#if error}
  <p>ERROR: {error}</p>
{:else}
  <p>Group {group.name}: {group.description}</p>
  {#if group.allowselfenrol}
    <p><a class="text-xl m-1 p-1 bg-gray-100 border-solid rounded inline-block"
          href="{group.site._id}/g/{group.id}/signup">Sign up</a></p>
  {:else}
    <p>You cannot sign up yourself; please ask whoever invited you to sign up for you</p>
  {/if}
{/if}

