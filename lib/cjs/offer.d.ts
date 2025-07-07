import { GoogleAuthOptions } from "google-auth-library";
import { OfferClass } from "./types/retail/offer/OfferClass.js";
import { Pagination } from "./types/retail/offer/Pagination.js";
import { OfferObject } from "./types/retail/offer/OfferObject.js";
import { AddMessageRequest } from "./types/retail/offer/AddMessageRequest.js";
export * from "./types/retail/offer/index.js";
export declare class OfferClient {
    private readonly httpClient;
    private readonly baseUrl;
    private readonly classUrl;
    private readonly objectUrl;
    constructor(credentials: GoogleAuthOptions["credentials"]);
    getClasses(issuerId: string, token?: string, maxResults?: number): Promise<{
        resources: OfferClass[];
        pagination: Pagination;
    }>;
    getClass(issuerId: string, classId: string): Promise<OfferClass | undefined>;
    createClass(classObject: OfferClass): Promise<OfferClass>;
    updateClass(classObject: OfferClass): Promise<OfferClass>;
    patchClass(classObject: OfferClass): Promise<OfferClass>;
    addClassMessage(issuerId: string, classId: string, message: AddMessageRequest): Promise<{
        resource: OfferClass;
    }>;
    getObjects(issuerId: string, classId: string, token?: string, maxResults?: number): Promise<{
        resources: OfferObject[];
        pagination: Pagination;
    }>;
    getObject(issuerId: string, objectId: string): Promise<OfferObject | undefined>;
    createObject(object: OfferObject): Promise<OfferObject>;
    updateObject(object: OfferObject): Promise<OfferObject>;
    patchObject(object: OfferObject): Promise<OfferObject>;
    addObjectMessage(issuerId: string, objectId: string, message: AddMessageRequest): Promise<{
        resource: OfferObject;
    }>;
}
