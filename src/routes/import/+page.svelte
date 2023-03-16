<script lang="ts">
	(async () => {
		const base = new URL(location.toString()).searchParams.get("base")!;
		if (!(base in localStorage)) {
			const resp = await fetch("get_book", {
				method: "POST",
				body: JSON.stringify({ base }),
			});
			localStorage.setItem(base, await resp.text());
		}
		location.replace("/");
	})();
</script>

<div class="center">
	Was too lazy to make a loading screen.
	<br />
	Will redirect soon.
</div>

<style>
	.center {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
