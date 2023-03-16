<script lang="ts">
	type Book = {
		author: string;
		title: string;
		nodes: Node[];
	};

	type Term = {
		name: string;
		note: string;
	};

	type Node = {
		label: string;
		terms: Term[];
		nodes: Node[];
		selected?: boolean;
		thandler?: number;
	};

	let books = Object.values(localStorage).map((book) =>
		JSON.parse(book)
	) as Book[];

	let stack: Node[] = [];

	let rounds = 1;

	let terms: Term[] = [];
	let round = 0;
	let index = 0;
	let start = false;
	let notes = false;
	let texta = "";

	function fillTerms(node: Node) {
		if (node.selected != false) {
			terms = terms.concat(node.terms);
			for (const subnode of node.nodes) {
				fillTerms(subnode);
			}
		}
	}
</script>

<svelte:window
	on:popstate={() => {
		if (start) {
			start = false;
		} else {
			stack = stack.slice(0, stack.length - 1);
		}
	}}
/>

{#if stack.length > 0}
	{#if start}
		<div
			class="col"
			style="justify-content: space-between; height: calc(100vh - 3rem);"
		>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="box center large_text"
				style="height: 40vh;"
				on:click={() => {
					notes = !notes;
				}}
			>
				{notes ? terms[index].note : terms[index].name}
			</div>
			<textarea
				class="box large_text"
				style="height: 40vh; resize: none;"
				bind:value={texta}
			/>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="box large_text center"
				on:click={() => {
					if (terms.length - index == 1) {
						index = 0;
						round++;
					} else {
						index++;
					}
					texta = "";
					notes = false;
					if (round == rounds) {
						alert("Finished");
						history.back();
					}
				}}
			>
				Next
			</div>
		</div>
	{:else}
		<div
			style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh;"
		>
			<div class="col" style="overflow: scroll;">
				{#each stack[stack.length - 1].nodes as node}
					<div
						class="box large_text {node.selected ? 'sel' : ''}"
						on:pointerdown={() => {
							node.thandler = setTimeout(() => {
								navigator.vibrate(200);
								if (node.nodes.length > 0) {
									history.pushState({}, "");
									stack = [...stack, node];
									for (const subnode of node.nodes) {
										subnode.selected = false;
									}
									if (!node.selected) {
										node.selected = true;
									}
								}
							}, 300);
						}}
						on:pointerleave={() => {
							clearTimeout(node.thandler);
						}}
						on:pointerup={() => {
							if (node.thandler) {
								node.selected = !node.selected;
								clearTimeout(node.thandler);
								delete node.thandler;
							}
						}}
					>
						{node.label}
					</div>
				{/each}
			</div>
			<div class="col footer">
				<label for="rounds">Rounds: {rounds}</label>
				<input id="rounds" type="range" min="1" max="10" bind:value={rounds} />
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="box large_text"
					style="text-align: center;"
					on:click={() => {
						terms = [];
						fillTerms(stack[0]);
						if (terms.length > 0) {
							index = 0;
							round = 0;
							notes = false;
							start = true;
						} else {
							alert("There are no terms in the selected chapters");
						}
					}}
				>
					Start
				</div>
			</div>
		</div>
	{/if}
{:else}
	<div class="col">
		{#each books as book}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="box"
				on:click={() => {
					history.pushState({}, "");
					for (const node of book.nodes) {
						node.selected = false;
					}
					stack = [
						{
							label: book.title,
							nodes: book.nodes,
							terms: [],
							selected: true,
						},
					];
				}}
			>
				<span class="large_text">{book.title}</span>
				<br />
				<span class="small_text">{book.author}</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.large_text {
		font-size: larger;
		font-weight: 700;
	}

	.small_text {
		font-size: medium;
		font-weight: 300;
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}

	.box {
		user-select: none;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		padding: 1rem;
		/* box-shadow: 0 0 4px 1px #ddd; */
	}

	.box:hover {
		box-shadow: 0 0 4px 1px #ddd;
	}

	.sel {
		border: 1px solid #444;
	}

	.footer {
		user-select: none;
		position: sticky;
		bottom: 0;
		background-color: white;
		border-top: 1px solid #ccc;
	}

	.center {
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
	}
</style>
