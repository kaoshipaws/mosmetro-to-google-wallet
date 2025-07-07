import express from "express";
const router = express.Router();
import { randomBytes } from "crypto";
import { v4 as uuid } from "uuid";

import {
	APPLICATION_CONFIG,
	APPLICATION_PROXY_URL,
	GOOGLE_APPLICATION_CREDENTIALS,
	GOOGLE_APPLICATION_LOYALTY,
	GOOGLE_APPLICATION_ISSUER_ID,
	ConfigInit, ConfigSave, ConfigUpdate, ConfigAdd, ConfigFind, ConfigQuery,
	ErrorHandler
} from "../external.js";

function prop() {
	const buffer = randomBytes(4);
	const randomNumber = buffer.readUInt32BE();

	const time = Date.now();
	const timePart = time % 1_000_000_000;
	const mixed = (randomNumber ^ timePart) >>> 0;

	const client = 1_000_000_000 + (mixed % 3_000_000_000);
	return client;
}

const CLIENT_APP = {
	user_agent: `MosMetro/4.2.3 (7874) (Android; Google Pixel 9 Pro; 16; ${prop()})`,
	device: {
		id: randomBytes(8).toString("hex"),
		type: "android",
		displayName: "Google",
		os: "android",
		osVer: "16",
		model: "Pixel 9 Pro"
	}
};

async function CreateDevice() {
	try {
		const urlencoded = new URLSearchParams();
		urlencoded.append("vendor", CLIENT_APP.device.displayName);
		urlencoded.append("model", CLIENT_APP.device.model);
		urlencoded.append("softwareVersion", CLIENT_APP.device.osVer);

		const response = await fetch(APPLICATION_PROXY_URL, {
			method: "GET",
			headers: {
				"Target-URL": `https://lk.mosmetro.ru/api/devices/v1.0/settings?${urlencoded.toString()}`,
				"User-Agent": CLIENT_APP.user_agent,
				"X-Device-Id": CLIENT_APP.device.id,
			},
		});
		const info = await response.json();

		const application = await fetch(APPLICATION_PROXY_URL, {
			method: "GET",
			headers: {
				"Target-URL": `https://prodapp.mosmetro.ru/mobile-api/v1/application-update/action`,
				"User-Agent": CLIENT_APP.user_agent,
				"X-Device-Id": CLIENT_APP.device.id,
			},
		});
		const applicationData = await application.json();

		const initdevice = {
			...CLIENT_APP,
			...info,
			...applicationData
		};

		console.log(initdevice)

		ConfigAdd("devices", CLIENT_APP.device.id, initdevice);
		return CLIENT_APP.device.id;
	} catch (error) {
		return ErrorHandler(error, "Ошибка при создании устройства");
	}
};

router.get("/mosmetro/connect/otp/:username", async (req, res) => {
	try {
		const { username } = req.params;
		if (!username) return res.status(400).json({ error: "Username parameter is required" });

		console.log(`🔗 Получение OTP: ${username}`);

		let clientapp = null;
		let clientuuid = null;

		const findclient = ConfigFind("clients", username);

		if (findclient) {
			console.log(`🔍 Найдены существующие данные для клиента: ${username}`);
			const finddevice = ConfigFind("devices", findclient.device_id);

			if (!finddevice) {
				throw new Error(`устройство не найдено`);
			}

			clientuuid = findclient.uuid;
			clientapp = {
				user_agent: finddevice.user_agent,
				device: finddevice.device
			};
		} else {
			const clientid = await CreateDevice();
			const finddevice = ConfigFind("devices", clientid);
			clientuuid = uuid();
			clientapp = finddevice;
		}

		const urlencoded = new URLSearchParams();
		urlencoded.append("username", username);
		urlencoded.append("scope", "openid offline_access nbs.ppa idps phone email all");

		const response = await fetch(APPLICATION_PROXY_URL, {
			method: "POST",
			headers: {
				"Target-URL": `https://auth.mosmetro.ru/connect/otp`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": clientapp.user_agent,
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Basic ${Buffer.from(`${APPLICATION_CONFIG.mosmetro.client_id}:${APPLICATION_CONFIG.mosmetro.client_secret}`, "utf8").toString("base64")}`,
				"X-Device-Id": clientapp.device.id,
			},
			body: urlencoded.toString()
		});
		const otp = await response.json();

		if (otp.error) {
			throw new Error(JSON.stringify(otp));
		}

		const initclient = {
			uuid: clientuuid,
			device_id: clientapp.device.id,
			otp: otp
		};

		ConfigUpdate("clients", username, initclient);

		res.json({
			client: initclient,
			existing: findclient ? true : false,
		});

	} catch (error) {
		res.status(500).json({ error: `OTP_ERROR : ${error.message}` });
		ErrorHandler(error, "Ошибка при получении OTP");
	}
});

router.get("/mosmetro/connect/token/:key/:password", async (req, res) => {
	try {
		const { key, password } = req.params;
		if (!key) return res.status(400).json({ error: "Key parameter is required" });
		if (!password) return res.status(400).json({ error: "Password parameter is required" });

		const findclient = ConfigQuery("clients").where("otp.key", key).first();
		const finddevice = ConfigFind("devices", findclient.data.device_id);

		console.log(`🔗 Получение токена: ${findclient.key}`);

		const urlencoded = new URLSearchParams();
		urlencoded.append("grant_type", "otp");
		urlencoded.append("key", key);
		urlencoded.append("password", password);

		const response = await fetch(APPLICATION_PROXY_URL, {
			method: "POST",
			headers: {
				"Target-URL": `https://auth.mosmetro.ru/connect/token`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Basic ${Buffer.from(`${APPLICATION_CONFIG.mosmetro.client_id}:${APPLICATION_CONFIG.mosmetro.client_secret}`, "utf8").toString("base64")}`,
				"X-Device-Id": finddevice.device.id,
			},
			body: urlencoded.toString()
		});
		const auth = await response.json();

		if (auth.error) {
			throw new Error(JSON.stringify(auth));
		}

		const initclient = {
			auth: auth
		};

		ConfigUpdate("clients", findclient.key, initclient);

		res.json({
			client: initclient
		});

	} catch (error) {
		res.status(500).json({ error: `OTP_TOKEN_ERROR : ${error.message}` });
		ErrorHandler(error, "Ошибка при получении токена по OTP");
	}
});

router.get("/mosmetro/connect/:uuid", async (req, res) => {
	try {
		const { uuid } = req.params;
		if (!uuid) return res.status(400).json({ error: "UUID parameter is required" });

		const findclient = ConfigQuery("clients").where("uuid", uuid).first();
		const finddevice = ConfigFind("devices", findclient.data.device_id);
		console.log(`🔗 Получение токена через UUID: ${findclient.key}`);

		const urlencoded = new URLSearchParams();
		urlencoded.append("grant_type", "refresh_token");
		urlencoded.append("refresh_token", findclient.data.auth.refresh_token);

		const response = await fetch(APPLICATION_PROXY_URL, {
			method: "POST",
			headers: {
				"Target-URL": `https://auth.mosmetro.ru/connect/token`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Basic ${Buffer.from(`${APPLICATION_CONFIG.mosmetro.client_id}:${APPLICATION_CONFIG.mosmetro.client_secret}`, "utf8").toString("base64")}`,
				"X-Device-Id": finddevice.device.id,
			},
			body: urlencoded.toString()
		});
		const auth = await response.json();

		if (auth.error) {
			throw new Error(JSON.stringify(auth));
		}

		const initclient = {
			auth: auth
		};

		ConfigUpdate("clients", findclient.key, initclient);

		res.json({
			client: initclient
		});
	} catch (error) {
		res.status(500).json({ error: `UUID_TOKEN_ERROR : ${error.message}` });
		ErrorHandler(error, "Ошибка при получении токена по UUID");
	}
});

export default router;