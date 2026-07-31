import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { fileURLToPath } from "node:url";
import "./src/WidgetID.global.mjs";

const cReplayMode = process.env.EMO_DEPLOY_MODE === "replay";
const cPreviewLocatePath = "/__emo_preview_locate";
const cPreviewBridgeFirstPort = 38921;
const cPreviewBridgeLastPort = 38932;

const cPreviewIntegration = {
	name: "emo-preview",
	hooks: {
		"astro:server:setup": ({ server }) => {
			server.middlewares.use(cPreviewLocatePath, async (pRequest, pResponse) => {
				if (pRequest.method !== "POST") {
					SendPreviewJson(pResponse, 405, { ok: false, error: "Method Not Allowed" });
					return;
				}

				try {
					const cPayload = await ReadPreviewJson(pRequest);
					const cResult = await ForwardPreviewLocate(cPayload);
					SendPreviewJson(pResponse, cResult.ok ? 200 : 502, cResult);
				}
				catch (pError) {
					const cMessage = pError instanceof Error ? pError.message : String(pError);
					SendPreviewJson(pResponse, 500, { ok: false, error: cMessage });
				}
			});
		}
	}
};

async function ReadPreviewJson(pRequest) {
	const cChunks = [];
	let cLength = 0;

	for await (const cChunk of pRequest) {
		const cBuffer = Buffer.isBuffer(cChunk) ? cChunk : Buffer.from(cChunk);
		cLength += cBuffer.length;

		if (cLength > 262144) {
			throw new Error("Preview locate payload is too large.");
		}

		cChunks.push(cBuffer);
	}

	const cText = Buffer.concat(cChunks).toString("utf8");
	const cPayload = cText ? JSON.parse(cText) : {};
	return cPayload && typeof cPayload === "object" && !Array.isArray(cPayload) ? cPayload : {};
}

async function ForwardPreviewLocate(pPayload) {
	const cPorts = GetPreviewBridgePorts(pPayload);
	let cLastError = "No running preview bridge was found.";

	for (const cPort of cPorts) {
		const cAbortController = new AbortController();
		const cTimeout = setTimeout(() => cAbortController.abort(), 550);

		try {
			const cResponse = await fetch(`http://127.0.0.1:${cPort}${cPreviewLocatePath}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(pPayload || {}),
				signal: cAbortController.signal
			});
			let cResult;

			try {
				cResult = await cResponse.json();
			}
			catch {
				cResult = undefined;
			}

			if (cResponse.ok && cResult?.ok) {
				return { ok: true, bridgePort: cPort };
			}

			cLastError = cResult?.error || `Bridge ${cPort} returned HTTP ${cResponse.status}.`;
		}
		catch (pError) {
			cLastError = pError instanceof Error ? pError.message : String(pError);
		}
		finally {
			clearTimeout(cTimeout);
		}
	}

	return { ok: false, error: cLastError };
}

function GetPreviewBridgePorts(pPayload) {
	const cPorts = [];
	const AddPort = (pValue) => {
		const cPort = Number(pValue);

		if (Number.isInteger(cPort) && cPort > 0 && cPort <= 65535 && !cPorts.includes(cPort)) {
			cPorts.push(cPort);
		}
	};

	if (Array.isArray(pPayload?.bridgePorts)) {
		for (const cPort of pPayload.bridgePorts) {
			AddPort(cPort);
		}
	}

	for (let cPort = cPreviewBridgeFirstPort; cPort <= cPreviewBridgeLastPort; cPort++) {
		AddPort(cPort);
	}

	return cPorts;
}

function SendPreviewJson(pResponse, pStatusCode, pBody) {
	pResponse.statusCode = pStatusCode;
	pResponse.setHeader("Content-Type", "application/json; charset=utf-8");
	pResponse.setHeader("Cache-Control", "no-store");
	pResponse.end(JSON.stringify(pBody));
}

export default defineConfig({
	site: "https://www.emocrete.com",
	trailingSlash: "never",
	adapter: vercel({
		functionPerRoute: true
	}),
	devToolbar: {
		enabled: false
	},
	integrations: [
		cPreviewIntegration,
		...(cReplayMode ? [] : [sitemap()])
	],
	build: {
		inlineStylesheets: "always"
	},
	vite: {
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src/site", import.meta.url)),
			},
		},
	},
});
