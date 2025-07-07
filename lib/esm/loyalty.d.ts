import { GoogleAuthOptions } from "google-auth-library";
import { LoyaltyClass } from "./types/retail/loyalty-card/LoyaltyClass.js";
import { Pagination } from "./types/retail/loyalty-card/Pagination.js";
import { LoyaltyObject } from "./types/retail/loyalty-card/LoyaltyObject.js";
import { AddMessageRequest } from "./types/retail/loyalty-card/AddMessageRequest.js";
export * from "./types/retail/loyalty-card/index.js";
export declare class LoyaltyClient {
    private readonly httpClient;
    private readonly baseUrl;
    private readonly classUrl;
    private readonly objectUrl;
    constructor(credentials: GoogleAuthOptions["credentials"]);
    getClasses(issuerId: string, token?: string, maxResults?: number): Promise<{
        resources: LoyaltyClass[];
        pagination: Pagination;
    }>;
    getClass(issuerId: string, classId: string): Promise<LoyaltyClass | undefined>;
    createClass(classObject: LoyaltyClass): Promise<LoyaltyClass>;
    updateClass(classObject: LoyaltyClass): Promise<LoyaltyClass>;
    patchClass(classObject: LoyaltyClass): Promise<LoyaltyClass>;
    addClassMessage(issuerId: string, classId: string, message: AddMessageRequest): Promise<{
        resource: LoyaltyClass;
    }>;
    getObjects(issuerId: string, classId: string, token?: string, maxResults?: number): Promise<{
        resources: LoyaltyObject[];
        pagination: Pagination;
    }>;
    getObject(issuerId: string, objectId: string): Promise<LoyaltyObject | undefined>;
    createObject(object: LoyaltyObject): Promise<LoyaltyObject>;
    updateObject(object: LoyaltyObject): Promise<LoyaltyObject>;
    patchObject(object: LoyaltyObject): Promise<LoyaltyObject>;
    addObjectMessage(issuerId: string, objectId: string, message: AddMessageRequest): Promise<{
        resource: LoyaltyObject;
    }>;
}
