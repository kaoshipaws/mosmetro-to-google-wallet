import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";

import {
	APPLICATION_CONFIG,
	APPLICATION_PROXY_URL,
	GOOGLE_APPLICATION_CREDENTIALS,
	GOOGLE_APPLICATION_LOYALTY,
	GOOGLE_APPLICATION_ISSUER_ID,
	ConfigInit, ConfigSave, ConfigUpdate, ConfigAdd, ConfigFind, ConfigQuery,
	ErrorHandler
} from "../external.js";

// Создать новый билет в Google Wallet
router.get("/ticket/create/:uuid/:id", async (req, res) => {
	try {
		const { uuid, id } = req.params;
		if (!uuid) throw new Error("UUID is required");
		if (!id) throw new Error("ID is required");

		const wallet = await CreateWalletCard(uuid, id);
		const findclient = ConfigQuery("clients").where("uuid", uuid).first();
		const finddevice = ConfigFind("devices", findclient.data.device_id);

		const clientwallets = findclient.data.wallet || {};

		const nowwalletitem = {
			[id]: {
				card: id,
				url: wallet.url,
				linked: wallet.class.id,
				object: wallet.object.id,
			}
		};

		const newwalletdata = {
			...clientwallets,
			...nowwalletitem
		};

		ConfigUpdate("clients", findclient.key, { wallet: newwalletdata });

		res.json({
			message: "Билет создан успешно",
			wallet: wallet
		});

	} catch (error) {
		res.status(500).json({ error: `GOOGLE_WALLET_CREATE_ERROR : ${error.message}` });
		ErrorHandler(error, "Ошибка при создании новой карты в Google Wallet");
	}
});

// Обновить билет в Google Wallet
router.post("/ticket/update/:uuid/:id", async (req, res) => {
	try {
		const { uuid, id } = req.params;
		if (!uuid) throw new Error("UUID is required");
		if (!id) throw new Error("ID is required");

		const findclient = ConfigQuery("clients").where("uuid", uuid).first();
		const findclientcard = ConfigQuery("clients").where("wallet.card", id).first();

		if (!findclientcard) {
			throw new Error("Такой карты не существует")
		}

		const { ticketData } = req.body;
		const result = await UpdateTicket(findclientcard.object, ticketData);

		res.json({
			success: true,
			message: `Data updated`,
			data: result
		});
	} catch (error) {
		res.status(500).json({ error: `GOOGLE_WALLET_UPDATE_ERROR : ${error.message}` });
		ErrorHandler(error, "Ошибка при обновлении карты в Google Wallet");
	}
});

let NeedUpdateCardTimeout = {};

router.get("/ticket/qr/update/:uuid/:id", async (req, res) => {
	try {
		const { uuid, id } = req.params;
		if (!uuid) throw new Error("UUID is required");
		if (!id) throw new Error("ID is required");

		const oneMinute = 60 * 1000;

		const findclient = ConfigQuery("clients").where("uuid", uuid).first();
		const finddevice = ConfigFind("devices", findclient.data.device_id);
		const walletArray = Object.values(findclient.data?.wallet || {});
		const findclientcard = walletArray.find(w => w.card == id);

		if (!findclientcard) {
			throw new Error("Такой карты не существует")
		}

		// Обновляем токен
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

		// Получаем QR-код
		const responseQR = await fetch(APPLICATION_PROXY_URL, {
			method: "POST",
			headers: {
				"Target-URL": `https://lk.mosmetro.ru/api/carriers/v1.0/${id}/qrCode`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Content-Type": "application/json",
				"Authorization": `Bearer ${auth.access_token}`,
				"X-Device-Id": finddevice.device.id,
			},
			body: JSON.stringify({ "device": finddevice.device })
		});

		const qr = await responseQR.json();

		if (!responseQR.ok) {
			throw new Error(JSON.stringify(qr));
		}

		const dataCards = await fetch(APPLICATION_PROXY_URL, {
			method: "GET",
			headers: {
				"Target-URL": "https://lk.mosmetro.ru/api/carriers/v1.0/linked",
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Authorization": `Bearer ${auth.access_token}`,
				"X-Device-Id": finddevice.device.id,
			}
		});
		const responseDataCards = await dataCards.json()
		const responseDataCard = responseDataCards.data.cards.find(item => item.card.linkedCardId == id) || false;

		const dataTrips = await fetch(APPLICATION_PROXY_URL, {
			method: "GET",
			headers: {
				"Target-URL": `https://lk.mosmetro.ru/api/trips/v1.0?size=6&linkedCardIds=${id}`,
				"Access-Control-Request-Headers": "Content-Type, Authorization",
				"User-Agent": finddevice.user_agent,
				"Authorization": `Bearer ${auth.access_token}`,
				"X-Device-Id": finddevice.device.id,
			}
		});
		const responseDataAllTrips = await dataTrips.json();
		const responseDataTrips = responseDataAllTrips.data.items.filter(item => item.card.linkedCardId == id);

		const responseUpdateCard = await UpdateTicket(findclientcard.object,
			{
				loyaltyPoints: {
					label: "Data updated",
					localizedLabel: {
						defaultValue: {
							language: "en-US",
							value: "Data updated"
						},
						translatedValues: [
							{
								language: "ru-RU",
								value: "Дата обновления"
							}
						]
					},
					balance: {
						string: `${new Date(responseDataCard.balance.date).toLocaleString("ru-RU")}`
					}
				},
				secondaryLoyaltyPoints: {
					label: "Balance",
					localizedLabel: {
						defaultValue: {
							language: "en-US",
							value: "Balance"
						},
						translatedValues: [
							{
								language: "ru-RU",
								value: "Balance"
							}
						]
					},
					balance: {
						string: `${responseDataCard.balance.balance} ₽`
					}
				},
				messages: responseDataTrips.map(item => ({
					id: `trip-${item.id}`,
					header: item.displayName,
					body: new Date(item.trip.date).toLocaleString("ru-RU"),
				})),
				barcode: {
					type: "QR_CODE",
					value: qr.qrData,
					alternateText: `Valid until ${new Date(Date.now() + oneMinute).toLocaleTimeString("ru-RU")}`
				},
			}
		);
		const responseUpdateClassCard = await UpdateClassTicket(findclientcard.linked,
			{
				securityAnimation: {
					animationType: "FOIL_SHIMMER"
				},
			}
		);

		NeedUpdateCardTimeout[id] = setTimeout(async () => {
			await UpdateTicket(findclientcard.object,
				{
					loyaltyPoints: {
						label: "The QR-pass needs to be updated (⋮)",
						localizedLabel: {
							defaultValue: {
								language: "en-US",
								value: "The QR-pass needs to be updated (⋮)"
							},
							translatedValues: [
								{
									language: "ru-RU",
									value: "Необходимо обновить QR-код (⋮)"
								}
							]
						},
						balance: {
							string: "Expired"
						}
					},
					barcode: {
						alternateText: `Pass expired`
					}
				}
			);
			await UpdateClassTicket(findclientcard.linked,
				{
					securityAnimation: null
				}
			);
			console.log(`🍵 QR-код истёк`);
		}, oneMinute);

		res.json({
			success: true,
			data: qr,
			dataUpdate: responseUpdateCard,
			dataUpdateClass: responseUpdateClassCard,
			dataCard: responseDataCard,
			dataTrips: responseDataTrips
		});
	} catch (error) {
		res.json({
			success: false,
			error: error.message,
			errorDetail: error.cause
		});
	}
});

async function UpdateTicket(objectId, updateData) {
	try {
		const objectSuffix = objectId.split('.')[1];
		const existingObject = await GOOGLE_APPLICATION_LOYALTY.getObject(GOOGLE_APPLICATION_ISSUER_ID, objectSuffix);

		const updatedObject = {
			...existingObject,
			...updateData,
			id: objectId
		};

		const result = await GOOGLE_APPLICATION_LOYALTY.patchObject(updatedObject);
		return result;
	} catch (error) {
		throw new Error(`Ошибка обновления тикета: ${error.message}`);
	}
};

async function UpdateClassTicket(classId, updateData) {
	try {
		const classSuffix = classId.split('.')[1];
		const existingClass = await GOOGLE_APPLICATION_LOYALTY.getClass(GOOGLE_APPLICATION_ISSUER_ID, classSuffix);

		const updatedClass = {
			...existingClass,
			...updateData,
			reviewStatus: "UNDER_REVIEW",
			id: classId
		};

		const result = await GOOGLE_APPLICATION_LOYALTY.patchClass(updatedClass);
		return result;
	} catch (error) {
		throw new Error(`Ошибка обновления class тикета: ${error.message}`);
	}
};

async function CreateWalletCard(uuid, cardid) {
	
	try {
		console.log("🔄️ Создаем новый билет в Google Wallet...");
		const cardPrefix = "CARD_" + cardid;
		const namePrefix = "MOSMETRO_LOYALTY";
		const classPrefix = namePrefix + "_" + cardPrefix;

		const classData = {
			id: `${GOOGLE_APPLICATION_ISSUER_ID}.${classPrefix}`,
			issuerName: "Moscow Transport",
			programName: "QR-pass",
			programLogo: {
				sourceUri: {
					uri: "https://i.postimg.cc/G2QMRwrC/mosmetro-wallet.png"
				}
			},
			heroImage: {
				sourceUri: {
					uri: "https://i.postimg.cc/SxR72YhH/mosmetro-card-v2.png"
				}
			},
			hexBackgroundColor: "#000000",
			// securityAnimation: {
				// animationType: "FOIL_SHIMMER"
			// },
			multipleDevicesAndHoldersAllowedStatus: "ONE_USER_ALL_DEVICES",
			localizedIssuerName: {
				defaultValue: {
					language: "en-US",
					value: "Moscow Transport"
				},
				translatedValues: [
					{
						language: "ru-RU",
						value: "Транспорт Москвы"
					}
				]
			},
			localizedProgramName: {
				defaultValue: {
					language: "en-US",
					value: "QR-pass «Troika»"
				},
				translatedValues: [
					{
						language: "ru-RU",
						value: "Виртуальная «Тройка»"
					}
				]
			},
			reviewStatus: "UNDER_REVIEW"
		};

		console.log("📋 Создаем/обновляем класс карты...");

		let loyaltyClass;

		try {
			// Сначала пытаемся создать новый класс
			console.log("➕ Пытаемся создать новый класс...");
			loyaltyClass = await GOOGLE_APPLICATION_LOYALTY.createClass(classData);
			console.log("✅ Новый класс карты создан успешно!");
		} catch (error) {
			if (error.response && error.response.status === 409) {
				// Класс уже существует, обновляем его
				console.log("🔄 Класс карты уже существует, обновляем...");
				try {
					loyaltyClass = await GOOGLE_APPLICATION_LOYALTY.patchClass(classData);
					console.log("✅ Класс карты обновлен успешно!");
				} catch (patchError) {
					// Если патч не работает, пытаемся получить существующий класс
					console.log("📥 Получаем существующий класс...");
					loyaltyClass = await GOOGLE_APPLICATION_LOYALTY.getClass(GOOGLE_APPLICATION_ISSUER_ID, classPrefix);
					console.log("✅ Существующий класс получен!");
				}
			} else {
				// Другая ошибка
				console.error("❌ Ошибка при создании класса:", error.message);
				throw error;
			}
		}

		// Создаем объект карты лояльности с уникальным суффиксом
		// const timestamp = Date.now();
		// const randomSuffix = Math.random().toString(36).substring(2, 8);
		// const objectSuffix = `MOSMETRO_LOYALTY_${timestamp}_${randomSuffix}`;
		const objectSuffix = namePrefix + "_OBJECT_" + cardPrefix;

		const objectData = {
			id: `${GOOGLE_APPLICATION_ISSUER_ID}.${objectSuffix}`,
			classId: loyaltyClass.id,
			state: "ACTIVE",
			//passConstraints: {
			//	screenshotEligibility: "INELIGIBLE",
			//},
			loyaltyPoints: {
				label: "Go to the menu, find and click \"Reissue QR-pass\"",
				localizedLabel: {
					defaultValue: {
						language: "en-US",
						value: "Go to the menu, find and click \"Reissue QR-pass\""
					},
					translatedValues: [
						{
							language: "ru-RU",
							value: "Перейдите в меню, найдите и нажмите \"Перевыпустить QR-код\""
						}
					]
				},
				balance: {
					string: "Action is required"
				}
			},
			linksModuleData: {
				uris: [
					{
						uri: `https://97497.zetalink.ru/api/googlewallet/ticket/qr/update/${uuid}/${cardid}`,
						description: "Reissue QR-pass",
						localizedDescription: {
							defaultValue: {
								language: "en-US",
								value: "Reissue QR-pass"
							},
							translatedValues: [
								{
									language: "ru-RU",
									value: "Перевыпустить QR-код"
								}
							]
						}
					}
				]
			}
		};

		console.log("🎫 Создаем/обновляем объект карты...");
		let loyaltyObject;
		try {
			// Сначала пытаемся создать новый объект
			console.log("➕ Пытаемся создать новый объект карты...");
			loyaltyObject = await GOOGLE_APPLICATION_LOYALTY.createObject(objectData);
			console.log("✅ Новый объект карты создан успешно!");
		} catch (error) {
			if (error.response && error.response.status === 409) {
				// Объект уже существует, обновляем его
				console.log("🔄 Объект карты уже существует, обновляем...");
				try {
					loyaltyObject = await GOOGLE_APPLICATION_LOYALTY.patchObject(objectData);
					console.log("✅ Объект карты обновлен успешно!");
				} catch (patchError) {
					// Если патч не работает, пытаемся получить существующий объект
					console.log("📥 Получаем существующий объект...");
					loyaltyObject = await GOOGLE_APPLICATION_LOYALTY.getObject(GOOGLE_APPLICATION_ISSUER_ID, objectSuffix);
					console.log("✅ Существующий объект получен!");
				}
			} else {
				// Другая ошибка
				console.error("❌ Ошибка при создании объекта:", error.message);
				throw error;
			}
		}

		// Генерируем JWT токен
		console.log("🔑 Генерируем JWT токен...");

		let privateKey = GOOGLE_APPLICATION_CREDENTIALS.private_key;

		const token = jwt.sign({
			iss: GOOGLE_APPLICATION_CREDENTIALS.client_email,
			aud: "google",
			origins: ["97497.zetalink.ru"],
			typ: "savetowallet",
			payload: {
				loyaltyClasses: [loyaltyClass],
				loyaltyObjects: [loyaltyObject],
			},
		}, privateKey, {
			algorithm: "RS256",
		});

		// Создаем URL для сохранения в кошелек
		const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

		console.log("\n🎉 Карта создана успешно!");
		console.log("📄 Класс карты ID:", loyaltyClass.id);
		console.log("🎫 Объект карты ID:", loyaltyObject.id);
		console.log("🔗 URL для добавления в Google Wallet:");
		console.log(saveUrl);
		console.log("\n💡 Откройте эту ссылку в браузере, чтобы добавить карту в Google Wallet");

		return {
			url: saveUrl,
			class: loyaltyClass,
			object: loyaltyObject
		};

	} catch (error) {
		console.error("❌ Ошибка при создании карты:", error.message);

		if (error.response) {
			console.error("📋 Детали ошибки:");
			console.error("   Код ошибки:", error.response.status);
			console.error("   Сообщение:", error.response.data?.error?.message);
		}

		throw error;
	}
}

export default router;