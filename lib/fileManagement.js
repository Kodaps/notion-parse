"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageFolderPath = exports.getFilePath = exports.getImageFolder = exports.getFileFolder = void 0;
var getFileFolder = function (filetype, lang) {
    var langBit = (!!lang) ? "".concat(lang, "/") : '';
    var contentFolder = filetype.toLowerCase();
    return "./src/content/".concat(contentFolder, "/").concat(langBit);
};
exports.getFileFolder = getFileFolder;
var getImageFolder = function (filetype) {
    var contentFolder = filetype.toLowerCase();
    return "/images/".concat(contentFolder, "/");
};
exports.getImageFolder = getImageFolder;
var getFilePath = function (slug, filetype, lang) {
    var fileFolder = (0, exports.getFileFolder)(filetype, lang);
    return "".concat(fileFolder).concat(slug, ".md");
};
exports.getFilePath = getFilePath;
var getImageFolderPath = function (slug, filetype) {
    var contentFolder = filetype.toLowerCase();
    return "/images/".concat(contentFolder, "/").concat(slug, "/");
};
exports.getImageFolderPath = getImageFolderPath;
