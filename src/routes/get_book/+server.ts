import { load, type CheerioAPI } from "cheerio";

export async function POST({ request, fetch }) {
	const { base } = await request.json();
	const resp = await fetch(base + "toc.ncx", {
		headers: { referer: "https://elevate.cambridge.org" },
	});
	const text = await resp.text();
	const $ = load(text, { xml: true });
	return new Response(
		JSON.stringify({
			author: $("docAuthor:first").text(),
			title: $("docTitle:first").text(),
			nodes: await getNodes($, base, fetch),
		}),
		{ headers: { "content-type": "application/json" } }
	);
}

type Fetch = typeof fetch;

async function getNodes($: CheerioAPI, base: string, fetch: Fetch) {
	const nodes = $("navMap:first > navPoint")
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
