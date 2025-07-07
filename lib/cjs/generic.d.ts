import { GoogleAuthOptions } from "google-auth-library";
import { GenericClass } from "./types/generic/GenericClass.js";
import { GenericObject } from "./types/generic/GenericObject.js";
import { Pagination } from "./types/generic/Pagination.js";
export * from "./types/generic/index.js";
export declare class GenericClient {
    private readonly httpClient;
    private readonly baseUrl;
    private readonly classUrl;
    private readonly objectUrl;
    constructor(credentials: GoogleAuthOptions["credentials"]);
    getClasses(issuerId: string, token?: string, maxResults?: number): Promise<{
        resources: GenericClass[];
        pagination: Pagination;
    }>;
    getClass(issuerId: string, classId: string): Promise<GenericClass | undefined>;
    createClass(classObject: GenericClass): Promise<GenericClass>;
    updateClass(classObject: GenericClass): Promise<GenericClass>;
    patchClass(classObject: GenericClass): Promise<GenericClass>;
    getObjects(issuerId: string, classId: string, token?: string, maxResults?: number): Promise<{
        resources: GenericObject[];
        pagination: Pagination;
    }>;
    getObject(issuerId: string, objectId: string): Promise<GenericObject | undefined>;
    createObject(object: GenericObject): Promise<GenericObject>;
    updateObject(object: GenericObject): Promise<GenericObject>;
    patchObject(object: GenericObject): Promise<GenericObject>;
}
