"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferClient = void 0;
const google_auth_library_1 = require("google-auth-library");
__exportStar(require("./types/retail/offer/index.js"), exports);
class OfferClient {
    httpClient;
    baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1";
    //private batchUrl = "https://walletobjects.googleapis.com/batch";
    classUrl = `${this.baseUrl}/offerClass`;
    objectUrl = `${this.baseUrl}/offerObject`;
    constructor(credentials) {
        this.httpClient = new google_auth_library_1.GoogleAuth({
            credentials,
            scopes: "https://www.googleapis.com/auth/wallet_object.issuer",
        });
    }
    async getClasses(issuerId, token, maxResults) {
        const qs = new URLSearchParams({ issuerId });
        if (token)
            qs.append("token", token);
        if (maxResults)
            qs.append("maxResults", maxResults.toString());
        const url = `${this.classUrl}?${qs.toString()}`;
        const res = await this.httpClient.request({ url });
        return res.data;
    }
    async getClass(issuerId, classId) {
        try {
            const url = `${this.classUrl}/${issuerId}.${classId}`;
            const res = await this.httpClient.request({ url });
            return res.data;
        }
        catch (err) {
            if (typeof err === "object") {
                const objErr = err;
                if (objErr.response && objErr.response.status === 404)
                    return undefined;
            }
            throw err;
        }
    }
    async createClass(classObject) {
        const url = this.classUrl;
        const res = await this.httpClient.request({
            url,
            method: "POST",
            data: classObject,
        });
        return res.data;
    }
    async updateClass(classObject) {
        const url = `${this.classUrl}/${classObject.id}`;
        const res = await this.httpClient.request({
            url,
            method: "PUT",
            data: classObject,
        });
        return res.data;
    }
    async patchClass(classObject) {
        const url = `${this.classUrl}/${classObject.id}`;
        const res = await this.httpClient.request({
            url,
            method: "PATCH",
            data: classObject,
        });
        return res.data;
    }
    async addClassMessage(issuerId, classId, message) {
        const url = `${this.classUrl}/${issuerId}.${classId}/addMessage`;
        const res = await this.httpClient.request({
            url,
            method: "POST",
            data: message,
        });
        return res.data;
    }
    async getObjects(issuerId, classId, token, maxResults) {
        const qs = new URLSearchParams({ classId: `${issuerId}.${classId}` });
        if (token)
            qs.append("token", token);
        if (maxResults)
            qs.append("maxResults", maxResults.toString());
        const url = `${this.objectUrl}?${qs.toString()}`;
        const res = await this.httpClient.request({ url });
        return res.data;
    }
    async getObject(issuerId, objectId) {
        try {
            const url = `${this.objectUrl}/${issuerId}.${objectId}`;
            const res = await this.httpClient.request({ url });
            return res.data;
        }
        catch (err) {
            if (typeof err === "object") {
                const objErr = err;
                if (objErr.response && objErr.response.status === 404)
                    return undefined;
            }
            throw err;
        }
    }
    async createObject(object) {
        const url = this.objectUrl;
        const res = await this.httpClient.request({
            url,
            method: "POST",
            data: object,
        });
        return res.data;
    }
    async updateObject(object) {
        const url = `${this.objectUrl}/${object.id}`;
        const res = await this.httpClient.request({
            url,
            method: "PUT",
            data: object,
        });
        return res.data;
    }
    async patchObject(object) {
        const url = `${this.objectUrl}/${object.id}`;
        const res = await this.httpClient.request({
            url,
            method: "PATCH",
            data: object,
        });
        return res.data;
    }
    async addObjectMessage(issuerId, objectId, message) {
        const url = `${this.objectUrl}/${issuerId}.${objectId}/addMessage`;
        const res = await this.httpClient.request({
            url,
            method: "POST",
            data: message,
        });
        return res.data;
    }
}
exports.OfferClient = OfferClient;
//# sourceMappingURL=offer.js.map