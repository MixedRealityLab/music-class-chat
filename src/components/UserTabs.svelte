<script>
  export let url;
  export let page; // chats, rewards, settings, resources
</script>

<div class="w-full pt-1 pb-1 grid grid-cols-4 gap-1 text-white text-center font-bold">
  <a href="{url}/"><div class="py-1 cursor-pointer" class:text-blue-400="{page=='chats'}">Chats</div></a>
  <a href="{url}/rewards"><div class="py-1 cursor-pointer" class:text-blue-400="{page=='rewards'}">Rewards</div></a>
  <a href="{url}/resources"><div class="py-1 cursor-pointer" class:text-blue-400="{page=='resources'}">Resources</div></a>
  <a href="{url}/settings"><div class="py-1 cursor-pointer" class:text-blue-400="{page=='settings'}">Settings</div></a>
</div>

