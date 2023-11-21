import { DatabaseObjectResponse, PageObjectResponse, PartialDatabaseObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
interface DocumentType {
    databaseId: string;
    languageField?: string;
    contentType: string;
    filterFields?: Array<string>;
}
export declare const parseNotionPage: (page: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse, contentType: string, debug?: boolean) => Promise<{
    [key: string]: any;
}>;
export declare const parseNotion: (token: string, contentRoot: string, contentTypes: Array<DocumentType>, debug?: boolean) => Promise<void>;
export {};
