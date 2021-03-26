<script context="module" lang="ts">
	import type {Preload} from "@sapper/common";

	export const preload: Preload = async function (this, page, session) {
		const {sid} = page.params

		const res = await this.fetch(`api/admin/${sid}/session?key=${page.query.key}`)
		if (res.status !== 200) {
			return this.redirect('302', `/${sid}/admin/login`)
		} else {
			return this.redirect('302', `/${sid}/admin`)
		}
	}
</script>