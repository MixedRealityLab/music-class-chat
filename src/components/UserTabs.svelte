<script>
  export let url;
  export let page; // chats, rewards, settings, resources
</script>

<div class="w-full pt-1 pb-1 bg-gray-700 grid grid-cols-4 gap-1 text-white text-center">
  <a href="{url}/"><div class="py-1 cursor-pointer" class:bg-gray-500="{page=='chats'}" class:text-gray-500="{page!='chats'}">Chats</div></a>
  <a href="{url}/rewards"><div class="py-1 cursor-pointer" class:bg-gray-500="{page=='rewards'}" class:text-gray-500="{page!='rewards'}">Rewards</div></a>
  <a href="{url}/resources"><div class="py-1 cursor-pointer" class:bg-gray-500="{page=='resources'}" class:text-gray-500="{page!='resources'}">Resources</div></a>
  <a href="{url}/settings"><div class="py-1 cursor-pointer" class:bg-gray-500="{page=='settings'}" class:text-gray-500="{page!='settings'}">Settings</div></a>
</div>

