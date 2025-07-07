/**
 * 
 * 
 * MAIN APP
 * 
 * 
 */

import express from "express";

delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;

import {
	APPLICATION_CONFIG,
	APPLICATION_PROXY_URL,
	GOOGLE_APPLICATION_CREDENTIALS,
	GOOGLE_APPLICATION_LOYALTY,
	GOOGLE_APPLICATION_ISSUER_ID,
	saveConfig, loadConfig
} from "./server/external.js";

loadConfig();

const app = express();
const PORT = 8088;

app.use(express.json());

// Установка EJS
app.set("view engine", "ejs");
app.set("views", "./server/views");
app.use(express.static("./server/public"));

// API роуты
import {
	UseAPIRouterAccount,
	UseAPIRouterDevices,
	UseAPIRouterGoogleWallet,
	UseWEBRouter
} from "./server/routes.js";

app.use("/web", UseWEBRouter);
app.use("/api/account", UseAPIRouterAccount);
app.use("/api/device", UseAPIRouterDevices);
app.use("/api/googlewallet", UseAPIRouterGoogleWallet);

app.listen(PORT, "0.0.0.0", () => {
	console.log(`🚀 Main server listening on port http://0.0.0.0:${PORT}`);
});


/**
 * 
 * 
 * PROXY SERVER
 * 
 * 
 */

import request from "request";
const proxy = express();

proxy.use(express.json());
proxy.use(express.urlencoded({ extended: true }));
proxy.use(express.text());

proxy.all("/proxy", (req, res) => {
	console.log("📥 Request:", req.method, req.headers["target-url"]);

	// --- CORS headers --- //
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
	res.header("Access-Control-Allow-Headers", req.header("access-control-request-headers") || "*");

	if (req.method === "OPTIONS") {
		return res.sendStatus(204);
	}

	const targetURL = req.header('Target-URL');
	if (!targetURL) {
		return res.status(400).json({ error: "Missing Target-URL header" });
	}

	const contentType = req.headers["content-type"] || "";

	const headers = { ...req.headers };
	delete headers["host"];
	delete headers["content-length"];
	delete headers["accept-encoding"];
	delete headers["target-url"];
	delete headers["connection"];
	delete headers["access-control-request-headers"];

	// Конфигурация проксируемого запроса
	const requestOptions = {
		url: targetURL,
		method: req.method,
		headers: headers,
	};

	// Определяем, как передать тело запроса
	if (contentType.includes("application/json")) {
		requestOptions.json = req.body;
	} else if (contentType.includes("application/x-www-form-urlencoded")) {
		requestOptions.form = req.body;
	} else if (typeof req.body === "string") {
		requestOptions.body = req.body;
	} else {
		// fallback
		requestOptions.body = req.body;
	}

	console.log("📦 requestOptions:", requestOptions);

	// Выполняем проксирование
	request(requestOptions)
		.on("error", err => {
			console.error("❌ Proxy error:", err.message);
			res.status(500).json({ error: err.message });
		})
		.pipe(res);
});

// --- Запуск сервера --- //
const PROXY_PORT = 9998;
proxy.listen(PROXY_PORT, () => {
	console.log(`🚀 Proxy server listening on port ${PROXY_PORT}`);
});
