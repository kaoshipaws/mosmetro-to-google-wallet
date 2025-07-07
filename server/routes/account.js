import express from "express";
const router = express.Router();

import {
	APPLICATION_CONFIG,
	APPLICATION_PROXY_URL,
	GOOGLE_APPLICATION_CREDENTIALS,
	GOOGLE_APPLICATION_LOYALTY,
	GOOGLE_APPLICATION_ISSUER_ID,
	ConfigInit, ConfigSave, ConfigUpdate, ConfigAdd, ConfigFind, ConfigQuery,
	ErrorHandler
} from "../external.js";

router.get("/mosmetro/info/:bearer", async (req, res) => {
	try {
		const { bearer } = req.params;
		if (!bearer) return res.status(400).json({ error: "Bearer token is required" });

		const findclient = ConfigQuery("clients").where("auth.access_token", bearer).first();
		const finddevice = ConfigFind("devices", findclient.data.device_id);
		console.log(`🔗 Получение информации пользователя через Bearer: ${findclient.key}`);

		const response = await fetch(APPLICATION_PROXY_URL, {
			method: "GET",
			headers: {
				"Target-URL": `https://lk.mosmetro.ru/api/accounts/v1.0/info`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": ` Bearer ${bearer}`,
				"X-Device-Id": finddevice.device.id,
			}
		});
		const info = await response.json();

		if (info.error) {
			throw new Error(JSON.stringify(info));
		}

		const infoclient = {
			info: info.data
		};

		ConfigUpdate("clients", findclient.key, infoclient);
		const clientreturn = ConfigFind("clients", findclient.key);

		res.json({
			client: clientreturn
		});
	} catch (error) {
		res.status(500).json({ error: `ACCOUNT_INFO_ERROR : ${error.message}` });
		ErrorHandler(error, "Ошибка при получении информации пользователя по Bearer");
	}
});

router.get("/mosmetro/linked/:bearer", async (req, res) => {
	try {
		const { bearer } = req.params;
		if (!bearer) return res.status(400).json({ error: "Bearer token is required" });

		const findclient = ConfigQuery("clients").where("auth.access_token", bearer).first();
		const finddevice = ConfigFind("devices", findclient.data.device_id);
		console.log(`🔗 Получение списка карт пользователя через Bearer: ${findclient.key}`);

		const response = await fetch(APPLICATION_PROXY_URL, {
			method: "GET",
			headers: {
				"Target-URL": `https://lk.mosmetro.ru/api/carriers/v1.0/linked`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": ` Bearer ${bearer}`,
				"X-Device-Id": finddevice.device.id,
			}
		});
		const linked = await response.json();

		if (linked.error) {
			throw new Error(JSON.stringify(linked));
		}

		const infoclient = {
			linked: linked.data
		};

		ConfigUpdate("clients", findclient.key, infoclient);
		const clientreturn = ConfigFind("clients", findclient.key);

		res.json({
			linked: linked
		});
	} catch (error) {
		res.status(500).json({ error: `ACCOUNT_LINKED_ERROR : ${error.message}` });
		ErrorHandler(error, "Ошибка при получении списка карт пользователя по Bearer");
	}
});

router.get("/mosmetro/transfer/:bearer/:id", async (req, res) => {
	try {
		const { bearer, id } = req.params;
		if (!bearer) return res.status(400).json({ error: "Bearer token is required" });
		if (!id) return res.status(400).json({ error: "Card ID is required" });

		const findclient = ConfigQuery("clients").where("auth.access_token", bearer).first();
		const finddevice = ConfigFind("devices", findclient.data.device_id);
		console.log(`🔗 Получение списка карт пользователя через Bearer: ${findclient.key}`);

		const transfer = await fetch(APPLICATION_PROXY_URL, {
			method: "POST",
			headers: {
				"Target-URL": `https://lk.mosmetro.ru/api/virtualTroika/v1.0/${id}/transfer`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Content-Type": "application/json",
				"Authorization": ` Bearer ${bearer}`,
				"X-Device-Id": finddevice.device.id,
			},
			body: JSON.stringify({
				"newDevice": finddevice.device
			})
		});

		console.log(transfer);

		const response = await fetch(APPLICATION_PROXY_URL, {
			method: "GET",
			headers: {
				"Target-URL": `https://lk.mosmetro.ru/api/carriers/v1.0/linked`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": ` Bearer ${bearer}`,
				"X-Device-Id": finddevice.device.id,
			}
		});
		const linked = await response.json();

		if (linked.error) {
			throw new Error(JSON.stringify(linked));
		}

		let infoclient = {
			linked: linked.data
		};

		if (transfer.bodyUsed == false && transfer.status == 200) {
			infoclient.wallet_card = id;
		}

		ConfigUpdate("clients", findclient.key, infoclient);
		const clientreturn = ConfigFind("clients", findclient.key);

		res.json({
			linked: linked
		});
	} catch (error) {
		res.status(500).json({ error: `TRANSFER_ERROR : ${error.message}` });
		ErrorHandler(error, "Ошибка при переносе карты по Bearer");
	}
});

router.get("/mosmetro/qr/:bearer/:id", async (req, res) => {
	try {
		const { bearer, id } = req.params;
		if (!bearer) return res.status(400).json({ error: "Bearer token is required" });
		if (!id) return res.status(400).json({ error: "Card ID is required" });

		const findclient = ConfigQuery("clients").where("auth.access_token", bearer).first();
		const finddevice = ConfigFind("devices", findclient.data.device_id);
		console.log(`🔗 Получение списка карт пользователя через Bearer: ${findclient.key}`);

		const transfer = await fetch(APPLICATION_PROXY_URL, {
			method: "POST",
			headers: {
				"Target-URL": `https://lk.mosmetro.ru/api/virtualTroika/v1.0/${id}/transfer`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Content-Type": "application/json",
				"Authorization": ` Bearer ${bearer}`,
				"X-Device-Id": finddevice.device.id,
			},
			body: JSON.stringify({
				"newDevice": finddevice.device
			})
		});

		console.log(transfer);

		const response = await fetch(APPLICATION_PROXY_URL, {
			method: "GET",
			headers: {
				"Target-URL": `https://lk.mosmetro.ru/api/carriers/v1.0/linked`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": ` Bearer ${bearer}`,
				"X-Device-Id": finddevice.device.id,
			}
		});
		const linked = await response.json();

		if (linked.error) {
			throw new Error(JSON.stringify(linked));
		}

		let infoclient = {
			linked: linked.data
		};

		if (transfer.bodyUsed == false && transfer.status == 200) {
			infoclient.wallet_card = id;
		}

		ConfigUpdate("clients", findclient.key, infoclient);
		const clientreturn = ConfigFind("clients", findclient.key);

		res.json({
			linked: linked
		});
	} catch (error) {
		res.status(500).json({ error: `TRANSFER_ERROR : ${error.message}` });
		ErrorHandler(error, "Ошибка при переносе карты по Bearer");
	}
});

export default router;