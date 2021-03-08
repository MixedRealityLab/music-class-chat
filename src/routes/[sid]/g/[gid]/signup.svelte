<script context="module" lang="ts">
  import type { Preload } from "@sapper/common";
  import type * as t from '../../../../_types';
  export const preload:Preload = async function(this, page, session) {
    const { sid, gid } = page.params;
    const res = await this.fetch(`/api/user/${sid}/g/${gid}`);
    const data = await res.json() as t.GenericResponse;
    if (data.error) {
      return { error: data.error };
    } else if (res.status !== 200) {
      return { error: `http response ${res.status}` };
    } else {
      return { group: data as t.UGroup };
    }
  }
</script>
<script lang="ts">
  import { goto, stores } from '@sapper/app';
  import type * as t from '../../../../_types';
  const { page, session } = stores();
  const { sid, gid } = $page.params;

  export let error: string;
  export let group: t.UGroup;
  let password = "";
  let initials = "";
  let pin = "";
  let email = "";
  let allowsubmit = true;

  const handleSignup = async () => {
    const request:t.SignupRequest = {
      password: password,
      initials: initials,
      email: email,
      pin: pin,
      anon: false,
    };
    const response = await fetch(`/api/user/${sid}/g/${gid}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request),
    });
    if (response.status !== 200) {
      error = `Sorry, there was a problem (${response.status})`;
      return;
    }
    try {
      const parsed = await response.json() as t.SignupResponse;
      console.log('signup response', parsed);
      if (parsed.userid) {
        // OK
        $session.group = group;
        $session.userid = parsed.userid;
        $session.pin = pin;
        goto(`/${sid}/g/${gid}/u/${parsed.userid}/`);
      } else {
        error = parsed.error;
      }
    }
    catch (err) {
      error = `Sorry, there was a problem (${err})`;
    }
  };

</script>

<h1>Sign up for Music Class Chat</h1>

<div class="px-2">

{#if error}
  <p>ERROR: {error}</p>
{:else}
  <p>Group: {group.name} - {group.description}</p>

  {#if group.allowselfenrol}

  <!-- TODO check for existing session/userid -->

  <form on:submit|preventDefault="{handleSignup}" method="post">
    <div class="grid grid-cols-1 gap-2">
      <label class="block">
        <span>Group joining code:</span>
        <input class="mt-1 block w-full" type="text" bind:value="{password}" />
      </label>
    {#if group.requireinitials}
      <label class="block">
        <span>Initials:</span>
        <input class="mt-1 block w-full" type="text" bind:value="{initials}" />
      </label>
    {/if}
    {#if group.requireemail}
      <label class="block">
        <span>Email address (to email a copy of your link, only):</span>
        <input class="mt-1 block w-full" type="text" bind:value="{email}" />
      </label>
    {/if}
    {#if group.requirepin}
      <label class="block">
        <span>Personal PIN (required to later access):</span>
        <input class="mt-1 block w-full" type="text" bind:value="{pin}" />
      </label>
    {/if}

      <button class="mt-1 block w-full bg-gray-300 py-2" 
       disabled={!allowsubmit} type="submit">Start</button>
    </div>
  </form>

  {:else}
    <p>You cannot sign up yourself; please ask whoever invited you to sign up for you</p>
  {/if}
{/if}

</div>
