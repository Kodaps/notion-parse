import { DatabaseObjectResponse, PageObjectResponse, PartialDatabaseObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
interface DocumentType {
    databaseId: string;
    languageField?: string;
    contentType: string;
    filterFields?: Array<string>;
}
export declare const parseNotionPage: (page: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse, contentType: string) => Promise<{
    [key: string]: any;
}>;
export declare const parseNotion: (token: string, contentRoot: string, contentTypes: Array<DocumentType>) => Promise<void>;
export {};
