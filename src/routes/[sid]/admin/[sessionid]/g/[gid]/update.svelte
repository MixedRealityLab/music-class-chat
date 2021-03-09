<script type="ts">
  import { stores } from '@sapper/app';
  const { page } = stores();
  const { sid, gid, sessionid } = $page.params;
  let files;
  let password;
  let statusCode = "";
  let working = false;
 
  async function handleSubmit() {
    if (files.length > 0) {
      working = true;
      const formData = new FormData();
      formData.append("spreadsheet", files[0]);
      formData.append("password", password); // TODO hash
      const response = await fetch(`/api/admin/${sid}/s/${sessionid}/g/${gid}/update`, {
        method: "POST",
        body: formData
      });
      statusCode = response.status;
      working = false;
    }
  }
</script>

<h1>Update Group</h1>

<div class="px-2">


<form on:submit|preventDefault={handleSubmit}>
  <div class="grid grid-cols-1 gap-2">
    <label class="block">
      <span>Password</span>
      <input class="mt-1 block w-full" required id="password" type="password" bind:value="{password}" />
    </label>
    <label class="block">
      <span>Spreadsheet (file):</span>
      <input class="mt-1 block w-full" required id="file" type="file" bind:files />
    </label>
    <input disabled={working} class="mt-1 block w-full bg-gray-300 py-2" type='submit' value='Update'>
</form>

{#if statusCode}
<p>Status: {statusCode}</p>
{/if}

</div>

