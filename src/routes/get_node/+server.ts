import { load, type CheerioAPI } from "cheerio";

export async function POST({ request }) {
	const { base, node } = await request.json();
	const $ = load(node, { xml: true });
	return new Response(
		JSON.stringify({
			label: $("navPoint:first > navLabel").text(),
			nodes: await getNodes($, base),
			terms: await getTerms($, base),
		}),
		{ headers: { "content-type": "application/json" } }
	);
}

async function getTerms($: CheerioAPI, base: string) {
	const resp = await fetch(base + $("navPoint:first > content").attr("src"), {
		headers: { referer: "https://elevate.cambridge.org" },
	});
	const text = await resp.text();
	$ = load(text);
	return $("span.hover_footnote")
		.toArray()
		.map((node) => {
			return {
				name: $(node.children[0]).text(),
				note: $(node.children[1]).text(),
			};
		});
}

async function getNodes($: CheerioAPI, base: string) {
	const nodes = $("navPoint:first > navPoint")
		.toArray()
		.map(async (node) => {
			const resp = await fetch("https://cee.aperso.dev/get_node", {
				method: "POST",
				body: JSON.stringify({
					base,
					node: $.xml(node),
				}),
			});
			return await resp.json();
		});
	return await Promise.all(nodes);
}
