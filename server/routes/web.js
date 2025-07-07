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

router.get("/{:uuid}", (req, res) => {
	try {
		const { uuid } = req.params;
		const client = ConfigQuery("clients").where("uuid", uuid ?? 0).first();

		if (client) {
			res.render("web", client);
		} else {
			res.render("web", {
				key: null,
				data: {},
			});
		}
	} catch (error) {
		res.status(500).json({ error: `WEB_ERROR : ${error.message}` });
		ErrorHandler(error, "Внутренняя ошибка сервера");
	}
});

router.get("/update/{:uuid}/{:cardid}", (req, res) => {
	try {
		const { uuid, cardid } = req.params;
		res.render("qr", { uuid, cardid });
	} catch (error) {
		res.status(500).json({ error: `WEB_ERROR : ${error.message}` });
		ErrorHandler(error, "Внутренняя ошибка сервера");
	}
});

export default router;