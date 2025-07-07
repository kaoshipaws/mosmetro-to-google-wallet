import { GoogleAuthOptions } from "google-auth-library";
import { GiftCardClass } from "./types/retail/gift-card/GiftCardClass.js";
import { Pagination } from "./types/retail/gift-card/Pagination.js";
import { GiftCardObject } from "./types/retail/gift-card/GiftCardObject.js";
import { AddMessageRequest } from "./types/retail/gift-card/AddMessageRequest.js";
export * from "./types/retail/gift-card/index.js";
export declare class GiftCardClient {
    private readonly httpClient;
    private readonly baseUrl;
    private readonly classUrl;
    private readonly objectUrl;
    constructor(credentials: GoogleAuthOptions["credentials"]);
    getClasses(issuerId: string, token?: string, maxResults?: number): Promise<{
        resources: GiftCardClass[];
        pagination: Pagination;
    }>;
    getClass(issuerId: string, classId: string): Promise<GiftCardClass | undefined>;
    createClass(classObject: GiftCardClass): Promise<GiftCardClass>;
    updateClass(classObject: GiftCardClass): Promise<GiftCardClass>;
    patchClass(classObject: GiftCardClass): Promise<GiftCardClass>;
    addClassMessage(issuerId: string, classId: string, message: AddMessageRequest): Promise<{
        resource: GiftCardClass;
    }>;
    getObjects(issuerId: string, classId: string, token?: string, maxResults?: number): Promise<{
        resources: GiftCardObject[];
        pagination: Pagination;
    }>;
    getObject(issuerId: string, objectId: string): Promise<GiftCardObject | undefined>;
    createObject(object: GiftCardObject): Promise<GiftCardObject>;
    updateObject(object: GiftCardObject): Promise<GiftCardObject>;
    patchObject(object: GiftCardObject): Promise<GiftCardObject>;
    addObjectMessage(issuerId: string, objectId: string, message: AddMessageRequest): Promise<{
        resource: GiftCardObject;
    }>;
}
