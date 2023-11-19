import { Client } from "@notionhq/client";
import { DatabaseObjectResponse, PageObjectResponse, PartialDatabaseObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
interface DocumentType {
    databaseId: string;
    languageField?: string;
    contentType: string;
}
declare const parseNotionPage: (page: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse, contentType: string) => Promise<{
    [key: string]: any;
}>;
declare const getDatabase: (notion: Client, database_id: string, contentType: string) => Promise<{
    [key: string]: any;
}[]>;
declare const parseNotion: (token: string, contentRoot: string, contentTypes: Array<DocumentType>) => Promise<void>;
export { getDatabase, parseNotionPage, parseNotion, };
