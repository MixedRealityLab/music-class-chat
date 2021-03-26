<script context="module" lang="ts">
	import type {Preload} from "@sapper/common";
	import type {UGroup} from "../../../_types";

	export const preload: Preload = async function (this, page, session) {
		const {sid} = page.params

		const res = await this.fetch(`/api/admin/${sid}/groups`)
		console.log(res.status)
		if (res.status === 401) {
			return this.redirect('302', `/${sid}/admin/login`)
		} else if (res.status !== 200) {
			return {error: `http response ${res.status}`};
		}
		const data = await res.json()
		if (data.error) {
			return {error: data.error};
		} else {
			return {groups: data as Array<UGroup>};
		}
	}
</script>


<script type="ts">
	export let groups: Array<UGroup> = []
</script>

<h1>Groups</h1>
