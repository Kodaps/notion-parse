
let rootFolder: string|null = null;

export const setRootFolder = (folder: string) => {
  rootFolder = folder;
  if (rootFolder?.endsWith('/')) {
    rootFolder = rootFolder.slice(0, -1);
  }
};


export const getFileFolder = (filetype: string, lang?: string) => {
  const langBit = (!!lang) ? `${lang}/` : '';
  const contentFolder = filetype.toLowerCase();
  return `${rootFolder}/${contentFolder}/${langBit}`;
};

export const getImageFolder = (filetype: string) => {
  const contentFolder = filetype.toLowerCase();
  return `/images/${contentFolder}/`;
};


export const getFilePath = (slug: string, filetype: string, lang?: string) => {
  const fileFolder = getFileFolder(filetype, lang);
  return `${fileFolder}${slug}.md`;
};

export const getImageFolderPath = (slug: string, filetype: string) => {
  const contentFolder = filetype.toLowerCase();
  return `/images/${contentFolder}/${slug}/`;
};
