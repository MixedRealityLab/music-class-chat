<script context="module" lang="ts">
  import type { Preload } from "@sapper/common";
  import type * as t from '../../../../_types';
  export const preload:Preload = async function(this, page, session) {
    const { sid, gid, uid } = page.params;
    const res = await this.fetch(`api/user/${sid}/g/${gid}/u/${uid}`);
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
  import UserTabs from '../../../../../../components/UserTabs.svelte';
  import { stores } from '@sapper/app';

  const { page } = stores();
  const { sid, gid, uid } = $page.params;
  export let error: string;
  export let user: t.UUser;
</script>


<AppBar title="{user ? user.group.name : 'Error'}"/>
<UserTabs url="{sid}/g/{gid}/u/{uid}" page="rewards"/>
<div class="px-2 pt-2">


{#if error}
  <p>ERROR: {error}</p>
{:else}

  <div class="grid grid-cols-2 gap-2">
  {#each user.rewards as reward}
    {#if (reward.got && reward.icon) || (!reward.got && reward.noicon)}
    <div  class="bg-gray-50 p-2 text-gray-400">
      <img src="{reward.got ? reward.icon : reward.noicon}" alt="reward {reward._id}">
    </div>
    {/if}
  {/each}
  </div>

{/if}

</div>
