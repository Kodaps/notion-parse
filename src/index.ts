import { Client } from "@notionhq/client";
import { DatabaseObjectResponse, PageObjectResponse, PartialDatabaseObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";
import { getFilePath, getImageFolder, getImageFolderPath } from "./fileManagement";

//const slugify = require('slugify');
const yaml = require('yaml');
const fs = require('fs');
const http = require('https');
const slugify = require('slugify');
// const dotenv = require('dotenv');
const Jimp = require('jimp');

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
}

const addDocumentTypes = (types: Array<DocumentType>) => {
  documentTypes.push(...types);
}


const downloadImage = async (fileUrl: string, destination: string) => {

  const src = destination; // `/images/${folder}/${name}`;

  const file = './public' + src;

  console.log('Checking if file exists: ', file);

  if (!fs.existsSync(file)) {
    console.log(`Downloading image ${file}`);
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

  console.log('Managing image for ', title, url);

  const slug = await getFieldInfo(properties, 'slug', contentType) || slugify(title, {
    lower: true,
    strict: true,
  });

  if (!slug) {
    throw new Error('No slug');
  }

  const destination: string = getImageFolder(contentType) + name;

  console.log("Destination: ", destination);

  return await downloadImage(url, destination);

}


const getFieldInfo = async (properties:{[key: string]: any}, name: string, contentType: string) => {
  const element = properties[name];

  //console.log('Getting field ', name, element);

  if (!element) {
    return null;
  }

  const type = element.type;

  //console.log('Field field ', name, ' is of type ', type);

  switch (type) {
    case 'title':
      return element.title[0]?.plain_text;
    case 'rich_text':
      return element.rich_text[0]?.plain_text;
    case 'date':
      return element.date.start;
    case 'url':
      return element.url;
    case 'checkbox':
      return element.checkbox;
    case 'number':
      return element.number;
    case 'select':
      return element.select?.name;
    case 'multi_select':
      return element.multi_select.map((item: { name: any; }) => item.name);
    case 'files':
      console.log(element.files[0]?.file, element.files[0]?.url, element.files[0]?.type, element.files[0]?.name);

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
        console.log('Dpwnloading', url, 'to', dest);
        const file = fs.createWriteStream(dest);

        response.pipe(file);
        file.on('finish', function () {
          console.log('Download done');
          file.close();
          res();
        });
      }
    });
  });
}


const parseNotionPage = async (page:PageObjectResponse| PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse, contentType: string ) => {
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
    fs.mkdirSync(dir);
}
}

const getDatabase = async (notion: Client, database_id: string, contentType: string) => {
  const request = await notion.databases.query({
    database_id,
  });

  const results = request.results;

  let ret = [];

  for (let page of results) {
    console.log('page: ', page);
    let item = await parseNotionPage(page, contentType);
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

  const title = frontMatter['title'];
  console.log('Processing page: ', title);

  if (!title && !frontMatter['slug']) {
    throw new Error(`No title or slug in front matter for ${notionId} of type ${type}`);
  }


  const slug = frontMatter['slug'] || slugify(title, {
    lower: true,
    strict: true,
  });

  const mdblocks = await n2m.pageToMarkdown(notionId);

  const imageBlocks = mdblocks.filter((block) => block.type === 'image').map((block) => block.parent);

  let images = [];

  let imagePath =  getImageFolderPath(slug, type);

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
  console.log('preparing to save: ', newFile);

  try {
    fs.writeFileSync(newFile, toFrontMatter(frontMatter) + mdBody.parent);
  } catch (e) {
    console.log('error title: ', title);
    console.error(e);
  }
};



const parseNotion = async (token: string, contentRoot: string, contentTypes: Array<DocumentType>) => {

  setNotionSecret(token);

  addDocumentTypes(contentTypes);

  console.log('Parsing notion content: ', contentRoot, contentTypes);

  if (!notionClient) {
    throw new Error('Notion client incorretly setup');
  }


  for (let type of contentTypes) {

    console.log('Processing type: ', type);

    const databaseId = type.databaseId;
    const lang = type.languageField;
    const contentType = type.contentType || databaseId;

    if (!databaseId) {
      throw new Error('No database id for type ' + type.contentType);
    }

    if (!contentType) {
      throw new Error('contentType id missing');
    }

    const database = await getDatabase(notionClient, databaseId, contentType);

    for (let page of database) {

      await saveFile(page, contentType, lang);

    }
  }
}





export {
  getDatabase,
  parseNotionPage,
  parseNotion,
};