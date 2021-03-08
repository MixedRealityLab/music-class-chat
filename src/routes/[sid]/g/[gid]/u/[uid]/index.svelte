<script context="module" lang="ts">
  import type { Preload } from "@sapper/common";
  import type * as t from '../../../../_types';
  export const preload:Preload = async function(this, page, session) {
    const { sid, gid, uid } = page.params;
    const res = await this.fetch(`/api/user/${sid}/g/${gid}/u/${uid}`);
    if (res.status !== 200) {
      return { error: `Sorry, there was a problem (${res.status})` };
    }
    const data = await res.json() as t.GenericResponse;
    if (data.error) {
      return { error: data.error };
    } else {
      return { user: data as t.UUser };
    }
  }
</script>
<script lang="ts">
  import AppBar from '../../../../../../components/AppBar.svelte';
  export let error: string;
  export let user: t.UUser;
</script>


<AppBar title="{user ? user.group.name : 'Error'}"/>
<div class="px-2">


{#if error}
  <p>ERROR: {error}</p>
{:else}

  <p>User {user._id} ...</p>

  <div class="grid grid-cols-1 gap-2">
  {#each user.chats as uc}
    
    <div class="mt-1 block w-full">
      <h2>{uc.chatdef.name}</h2>
      <p>{uc.chatdef.description}</p>
    </div>

  {/each}
  </div>

{/if}

</div>
