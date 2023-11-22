# notion-parse
An NPM module for downloading and Notion content and saving it as Markdown for NextJS. In short this takes the data from a page in a database and saves the data as FrontMatter and the content as Markdown. The second part is done by the excellent notion-to-md module.

I use this to download my Notion content and save it as Markdown for my NextJS blog. It's a work in progress, but it's working for me so far.

I also use ContentLayer to make sure my fontmatter has the right fields.

## Usage

Here is how I use the module in my NextJS project.

I have a .env file with the following variables :

```.env
NOTION_SECRET=secret_blablablablabla

NOTION_PORTFOLIO_DATABASE_ID=18abababababababababba
NOTION_NEWSLETTER_DATABASE_ID=19abababababababababba
NOTION_POST_DATABASE_ID=20abababababababababba
````

I then have this script that I run to download the content from Notion and save it as Markdown :

```js

// @ts-check

const NotionParse = require('@kodaps/notion-parse');
const dotenv = require('dotenv');

dotenv.config();

const go = async () => {

  if (process.env.NOTION_SECRET) {
    await NotionParse.parseNotion(process.env.NOTION_SECRET, './src/content', [
      {
        databaseId: process.env.NOTION_PORTFOLIO_DATABASE_ID || '',
        contentType: 'Portfolio'
      },
      {
        databaseId: process.env.NOTION_POST_DATABASE_ID || '',
        contentType: 'Post',
        languageField: 'lang',
        filterFields: [ 'translation', 'createdAt', 'status', 'Type']
      },
    ])
  }

};

go().then(() => {
  console.log('Done');
});

```

This supposed several things :
1. that the files are stored in a subfolder of the folder passed in as parameter (here `./src/content`) based on the content type
2. that the ContentLayer type names map to the subfolders. So for instance for the `Post` content type, the files will be stored in `./src/content/post`
3. that the Notion token and database IDs are stored in environment variables, and that there is one database per content type
4. That the title of the content is stored in a 'title' field in Notion
