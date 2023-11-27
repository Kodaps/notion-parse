import { Client } from "@notionhq/client";
import { DatabaseObjectResponse, PageObjectResponse, PartialDatabaseObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";
import { getFileFolder, getFilePath, getImageFolder, getImageFolderPath, setRootFolder } from "./fileManagement";

const yaml = require('yaml');
const fs = require('fs');
const http = require('https');
const slugify = require('slugify');
const Jimp = require('jimp');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let notionClient: Client|null = null;

let n2m: NotionToMarkdown|null = null;

const setNotionSecret = (auth: string) => {
  notionClient = new Client({
    auth,
  });

  n2m = new NotionToMarkdown({ notionClient });

}



const documentTypes = [];

interface DocumentType {
  databaseId: string;
  languageField?: string;
  contentType: string;
  filterFields?: Array<string>;
}

const addDocumentTypes = (types: Array<DocumentType>) => {
  documentTypes.push(...types);
}


const downloadImage = async (fileUrl: string, destination: string) => {

  const src = destination; // `/images/${folder}/${name}`;

  const file = './public' + src;

  if (!fs.existsSync(file)) {
    await wget(fileUrl, file); //element.properties.image.files[0].file.url, file);
  }

  let img = await Jimp.read(file);

  const width = img.getWidth();
  const height = img.getHeight();

  return {
    src,
    width,
    height,
  };
};


const manageImage = async (properties:{[key: string]: any}, url: string, contentType: string, name?: string) => {

  const title = await getFieldInfo(properties, 'title', contentType);

  const slug = await getFieldInfo(properties, 'slug', contentType) || slugify(title, {
    lower: true,
    strict: true,
  });

  if (!slug) {
    throw new Error('No slug');
  }

  checkFolder("./public" + getImageFolder(contentType));

  const destination: string = getImageFolder(contentType) + name;

  return await downloadImage(url, destination);

}


const getFieldInfo = async (properties:{[key: string]: any}, name: string, contentType: string) => {
  const element = properties[name];

  if (!element) {
    return null;
  }

  const type = element.type;

  switch (type) {
    case 'title':
      return element.title[0]?.plain_text;
    case 'rich_text':
      return element.rich_text[0]?.plain_text;
    case 'date':
      return element.date?.start;
    case 'url':
      return element.url;
    case 'checkbox':
      return element.checkbox;
    case 'number':
      return element.number;
    case 'select':
      return element.select?.name;
    case 'created_time':
      return element.created_time;
    case 'last_edited_time':
      return element.last_edited_time;
    case 'email':
      return element.email;
    case 'status':
      return element.status;
    case 'formula':
      return element.formula.number;
    case 'phone_number':
      return element.phone_number;
    case 'relation':
      return element.relation.map((item: { id: any; }) => item.id);
    case 'multi_select':
      return element.multi_select.map((item: { name: any; }) => item.name);
    case 'files':

      let url = element.files[0]?.url || element.files[0]?.file?.url;
      if (!url) {
        return null;
      }
      return await manageImage(properties, url, contentType, element.files[0]?.name);
    default:
      throw new Error(`Unknown type ${type}`);
  }
};



const toFrontMatter = (data: Object) => '---\n' + yaml.stringify(data) + '\n---\n';


function wget(url: string, dest: string): Promise<void> {
  return new Promise((res) => {
    http.get(url, (response: { statusCode: number; headers: { location: string; }; pipe: (arg0: any) => void; }) => {
      if (response.statusCode == 302) {
        // if the response is a redirection, we call again the method with the new location
        console.log('redirecting to ', response.headers.location);
        wget(String(response.headers.location), dest);
      } else {
        console.log('Downloading', url, 'to', dest);
        const file = fs.createWriteStream(dest);

        response.pipe(file);
        file.on('finish', function () {
          file.close();
          res();
        });
      }
    });
  });
}


export const parseNotionPage = async (page:PageObjectResponse| PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse, contentType: string, debug = false ) => {
  const obj:{[key:string]: any} = {
    notionId: page.id,
    type: contentType,
  };

  if ('properties' in page) {
    for (let field in (page.properties || {})) {

      const value = await getFieldInfo(page.properties, field, contentType);
      if (value !== null && value !== undefined && !obj[field]) {
        obj[field] = value;
      }
    }
  }

  return obj;
};

const checkFolder = (dir: string) => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}
}

const getDatabase = async (notion: Client, database_id: string, contentType: string, debug = false) => {
  const request = await notion.databases.query({
    database_id,
  });

  const results = request.results;

  let ret = [];

  if (debug) {
    console.log(`Got ${results.length} results from ${contentType} database`);
  }

  for (let page of results) {
    let item = await parseNotionPage(page, contentType, debug);
    ret.push(item);
  }

  return ret;
};

const saveFile = async (frontMatter: {[key: string]: any}, type: string, languageField?: string) => {

  if (!n2m) {
    throw new Error('Notion client not set');
  }

  const notionId = frontMatter['notionId'];
  const lang = languageField ? frontMatter[languageField] : '';

  if (lang) {
    checkFolder(getFileFolder(type, lang));
  }

  const title = frontMatter['title'];

  if (!title && !frontMatter['slug']) {
    throw new Error(`No title or slug in front matter for ${notionId} of type ${type}`);
  }

  const slug = frontMatter['slug'] || slugify(title, {
    lower: true,
    strict: true,
  });

  frontMatter['slug'] = slug;

  const mdblocks = await n2m.pageToMarkdown(notionId);

  const imageBlocks = mdblocks.filter((block) => block.type === 'image').map((block) => block.parent);

  let images = [];

  let imagePath =  getImageFolderPath(slug, type);

  console.log('checking imagePath ./public' + imagePath)

  checkFolder('./public' + imagePath);

  for (let block of imageBlocks) {

    let data = block.replace('![', '').replace(']', '').replace(')', '').split('(');

    if (data.length !== 2) {
      console.log('Error with image block: ', block);
      continue;
    }

    const url = data[1];
    const name = data[0];

    const filename = name.split('/').pop();

    const src = imagePath + filename;

    const file = `./public/${src}`;
    if (!fs.existsSync(file)) {
      await wget(url, file);
    }

    images.push({
      src,
      url,
      name
    });
  }

  const mdBody = n2m.toMarkdownString(mdblocks);

  for (let image of images) {
    mdBody.parent = mdBody.parent.replace(image.url, image.src);
  }


  const newFile = getFilePath(slug, type, lang);

  try {
    fs.writeFileSync(newFile, toFrontMatter(frontMatter) + mdBody.parent);
  } catch (e) {
    console.log('error with file: ', newFile);
    console.error(e);
  }
};



export const parseNotion = async (token: string, contentRoot: string, contentTypes: Array<DocumentType>, debug = false) => {

  console.log('Fetching data from Notion');

  setNotionSecret(token);

  setRootFolder(contentRoot);

  addDocumentTypes(contentTypes);

  if (!notionClient) {
    throw new Error('Notion client incorretly setup');
  }


  for (let type of contentTypes) {

    const databaseId = type.databaseId;
    const lang = type.languageField;
    const contentType = type.contentType || databaseId;

    if (!databaseId) {
      throw new Error('No database id for type ' + type.contentType);
    }

    if (!contentType) {
      throw new Error('contentType id missing');
    }

    console.log(`Fetching ${contentType} data`);


    const database = await getDatabase(notionClient, databaseId, contentType, debug);

    if (!database.length) {
      console.error(`Got ${database.length} items from ${contentType} database`);
    }

    console.log("checking "+ contentRoot + '/' + contentType.toLowerCase());
    checkFolder(contentRoot + '/' + contentType.toLowerCase());

    for (let page of database) {
      sleep(400);

      for(let field of (type.filterFields || [])) {
        if (page[field]) {
          delete page[field];
        }
      }

      await saveFile(page, contentType, lang);

    }
  }
}






