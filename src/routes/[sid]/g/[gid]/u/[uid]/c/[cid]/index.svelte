<script context="module" lang="ts">
  import type { Preload } from "@sapper/common";
  import type * as t from '../../../../../../_types';
  export const preload:Preload = async function(this, page, session) {
    const { sid, gid, uid, cid } = page.params;
    const ures = await this.fetch(`/api/user/${sid}/g/${gid}/u/${uid}`);
    if (ures.status !== 200) {
      return { error: `Sorry, there was a problem (${ures.status})` };
    }
    const udata = await ures.json() as t.GenericResponse;
    if (udata.error) {
      return { error: udata.error };
    }
    let user = udata as t.UUser;
    const ucres = await this.fetch(`/api/user/${sid}/g/${gid}/u/${uid}/c/${cid}`);
    if (ucres.status !== 200) {
      return { error: `Sorry, there was a problem (${ucres.status})` };
    }
    const ucdata = await ucres.json() as t.GenericResponse;
    if (ucdata.error) {
      return { error: ucdata.error };
    } 
    let userchat = ucdata as t.UUser;

    return { user, userchat };
  }
</script>
<script lang="ts">
  import AppBar from '../../../../../../../../components/AppBar.svelte';
  import Content from '../../../../../../../../components/Content.svelte';
  import { stores } from '@sapper/app';
  import { onDestroy, onMount } from 'svelte';
  import { getNextStep, isEnabled } from '../../../../../../../../_logic';
  import { ContentType } from '../../../../../../../../_types';

  export let error: string;
  export let user: t.UUser;
  export let userchat: t.UserChat;

  const { page } = stores();
  const { sid, gid, uid, cid } = $page.params;
  let backurl = `/${sid}/g/${gid}/u/${uid}/`;
  let reftime = new Date();
  let waitfor: string [] = null;
  let timer = null;
  let messages: t.UserMessage[] = userchat.messages;

  onDestroy(() => { if (timer) clearTimeout(timer); });

  onMount(checkMessages);

  async function checkMessages () {
    // chat might enable/deliver a message/content/rewards
    // or return some waitfors (and a timer?)
    timer = null;
    let userinput:string = "";
    if (userchat.messages.length>0) {
      userinput = userchat.messages[userchat.messages.length-1].userinput;
    }
    let now = new Date();
    const chatdef = userchat.chatdef as t.ChatDef; // trust me!
    const nextstep = getNextStep(user, userchat, chatdef, (now.getTime()-reftime.getTime())/1000, userinput);
    console.log(`nextstep`, nextstep);
    // TODO
    if (nextstep.done)
      return;
    if (nextstep.after!==undefined && nextstep.after!==null) {
      timer = setTimeout(nextstep.after, checkMessages);
      return;
    }
    if (nextstep.waitfor && nextstep.waitfor.length>0) {
      waitfor = nextstep.waitfor;
      return;
    }
    if (nextstep.do) {
      let umsg: t.UserMessage = {
        message: nextstep.do.message,
        content: nextstep.do.content,
        rewardicons: [],
        date: new Date().toISOString(),
      }
      if (nextstep.do.rewards) {
        for(let reward of nextstep.do.rewards) {
          let ur = user.rewards.find((r) => r._id == reward);
          if (ur && ur.icon) {
            umsg.rewardicons.push(ur.icon);
          }
        }
      }
      while (userchat.nextix < chatdef.messages.length && chatdef.messages[userchat.nextix].ornext) {
        userchat.nextix++;
      }
      userchat.nextix++;

      if (nextstep.do.jumpto) {
        for (let ix in chatdef.messages) {
          if (nextstep.do.jumpto == chatdef.messages[ix].label) {
            userchat.nextix = ix;
            break;
          }
        }
      }

      // patch client
      userchat.messages.push(umsg);
      messages = userchat.messages;
      // rewards, reset
      if (nextstep.do.rewards) {
        for (let reward of nextstep.do.rewards) {
          let userreward = user.rewards.find((ur) => ur._id == reward);
          if (userreward) {
            console.log(`got reward ${userreward._id}`);
            userreward.got = true;
          } else {
            console.log(`could not find reward ${reward} to add`);
          }
        }
      }
      if (nextstep.do.reset) {
        for (let reward of nextstep.do.reset) {
          let userreward = user.rewards.find((ur) => ur._id == reward);
          if (userreward) {
            console.log(`reset reward ${userreward._id}`);
            userreward.got = false;
          } else {
            console.log(`could not find reward ${reward} to reset`);
          }
        }
      }
      // enabled, etc. on UserChats
      for (let uc of user.chats) {
        uc.enabled = isEnabled(user.rewards, uc.allof, uc.andnot);
      }
      // content
      if (nextstep.do.content && !nextstep.do.content.hidden) {
        user.content.push(nextstep.do.content);
        user.content.sort((a,b) => (a.sortorder ? a.sortorder : 0)-(b.sortorder ? b.sortorder : 0));
      }
      // update server
      // TODO: waiting ?
      updateServer(umsg, nextstep.do.rewards, nextstep.do.reset, userchat.nextix, false);
      timer = setTimeout(checkMessages, 250);
    }
  }

  function handleUserInput(userinput: string) {
    if (timer) { clearTimeout(timer); timer = null; }
    let umsg: t.UserMessage = {
      userinput: userinput,
      //date: new Date().toISOString(),
    }
    // patch client
    userchat.messages.push(umsg);
    messages = userchat.messages;
    waitfor = [];
    // update server
    // TODO waiting ?
    updateServer(umsg, [], [], userchat.nextix, false);
    
    timer = setTimeout(checkMessages, 250);
  }
  
  // async? or just hope...
  async function updateServer(umsg: t.UserMessage, rewards: string[], reset: string[], nextix: number, waiting: boolean) {
    const req: t.AddUserMessageRequest = {
      message: umsg,
      rewards,
      reset,
      nextix,
      waiting,
    }
    const res = await fetch(`/api/user/${sid}/g/${gid}/u/${uid}/c/${cid}/addmessage`, {
      method: "POST",
      body: JSON.stringify(req),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status !== 200) {
      console.log(`error updating server (${res.status})`);
      return;
    }
    const data = await res.json() as t.GenericResponse;
    if (data.error) {
      console.log(`error updating server: udata.error`);
    }
    else { 
      console.log(`updated server`);
    }
  }

</script>


<AppBar title="{userchat ? userchat.chatdef.name : 'Error'}"
        backpage="{backurl}"/>
<div class="px-2">


{#if error}
  <p>ERROR: {error}</p>
{:else}


  <div class="grid grid-cols-1 gap-2">
  {#each messages as um}

    {#if um.date && (um.userinput || um.message || um.content || (um.rewards && um.rewards.length>0))}
      <p class="text-center text-sm">{um.date}</p>
    {/if}

    {#if um.userinput}
      <div class="mt-1 block w-full bg-gray-100 p-2">
        <p class="text-right">{um.userinput}</p>
      </div>
    {/if}

    {#if um.message}
      <div class="mt-1 block w-full bg-gray-300 p-2">
        <p>{um.message}</p>
      </div>
    {/if}

    {#if um.content}
      <Content content="{um.content}"/>
    {/if}

    {#if um.rewardicons}
    {#each um.rewardicons as icon}
      <div class="mt-1 block w-full bg-gray-300 p-2">
        <p><img src="{icon}" alt="{icon}"></p>
      </div>
    {/each}
    {/if}

  {/each}
  </div>

  {#if waitfor && waitfor.length>0 }
     <div class="mt-3 grid grid-cols-1 gap-2 bg-gray-800 p-2">
       <p class="text-white">Waiting for you to say...</p>
       {#each waitfor as userinput}
         <div class="mt-1 block w-full bg-gray-100 p-2" 
                 on:click={handleUserInput(userinput)}>
          <p class="text-right">{userinput}</p>
         </div>
       {/each}
     </div>
  {/if}

{/if}

</div>
