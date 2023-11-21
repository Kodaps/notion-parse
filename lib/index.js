"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNotion = exports.parseNotionPage = void 0;
var client_1 = require("@notionhq/client");
var notion_to_md_1 = require("notion-to-md");
var fileManagement_1 = require("./fileManagement");
var yaml = require('yaml');
var fs = require('fs');
var http = require('https');
var slugify = require('slugify');
var Jimp = require('jimp');
var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
var notionClient = null;
var n2m = null;
var setNotionSecret = function (auth) {
    notionClient = new client_1.Client({
        auth: auth,
    });
    n2m = new notion_to_md_1.NotionToMarkdown({ notionClient: notionClient });
};
var documentTypes = [];
var addDocumentTypes = function (types) {
    documentTypes.push.apply(documentTypes, types);
};
var downloadImage = function (fileUrl, destination) { return __awaiter(void 0, void 0, void 0, function () {
    var src, file, img, width, height;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                src = destination;
                file = './public' + src;
                if (!!fs.existsSync(file)) return [3 /*break*/, 2];
                return [4 /*yield*/, wget(fileUrl, file)];
            case 1:
                _a.sent(); //element.properties.image.files[0].file.url, file);
                _a.label = 2;
            case 2: return [4 /*yield*/, Jimp.read(file)];
            case 3:
                img = _a.sent();
                width = img.getWidth();
                height = img.getHeight();
                return [2 /*return*/, {
                        src: src,
                        width: width,
                        height: height,
                    }];
        }
    });
}); };
var manageImage = function (properties, url, contentType, name) { return __awaiter(void 0, void 0, void 0, function () {
    var title, slug, destination;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getFieldInfo(properties, 'title', contentType)];
            case 1:
                title = _a.sent();
                return [4 /*yield*/, getFieldInfo(properties, 'slug', contentType)];
            case 2:
                slug = (_a.sent()) || slugify(title, {
                    lower: true,
                    strict: true,
                });
                if (!slug) {
                    throw new Error('No slug');
                }
                destination = (0, fileManagement_1.getImageFolder)(contentType) + name;
                return [4 /*yield*/, downloadImage(url, destination)];
            case 3: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getFieldInfo = function (properties, name, contentType) { return __awaiter(void 0, void 0, void 0, function () {
    var element, type, _a, url;
    var _b, _c, _d, _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                element = properties[name];
                if (!element) {
                    return [2 /*return*/, null];
                }
                type = element.type;
                _a = type;
                switch (_a) {
                    case 'title': return [3 /*break*/, 1];
                    case 'rich_text': return [3 /*break*/, 2];
                    case 'date': return [3 /*break*/, 3];
                    case 'url': return [3 /*break*/, 4];
                    case 'checkbox': return [3 /*break*/, 5];
                    case 'number': return [3 /*break*/, 6];
                    case 'select': return [3 /*break*/, 7];
                    case 'created_time': return [3 /*break*/, 8];
                    case 'last_edited_time': return [3 /*break*/, 9];
                    case 'email': return [3 /*break*/, 10];
                    case 'status': return [3 /*break*/, 11];
                    case 'phone_number': return [3 /*break*/, 12];
                    case 'relation': return [3 /*break*/, 13];
                    case 'multi_select': return [3 /*break*/, 14];
                    case 'files': return [3 /*break*/, 15];
                }
                return [3 /*break*/, 17];
            case 1: return [2 /*return*/, (_b = element.title[0]) === null || _b === void 0 ? void 0 : _b.plain_text];
            case 2: return [2 /*return*/, (_c = element.rich_text[0]) === null || _c === void 0 ? void 0 : _c.plain_text];
            case 3: return [2 /*return*/, (_d = element.date) === null || _d === void 0 ? void 0 : _d.start];
            case 4: return [2 /*return*/, element.url];
            case 5: return [2 /*return*/, element.checkbox];
            case 6: return [2 /*return*/, element.number];
            case 7: return [2 /*return*/, (_e = element.select) === null || _e === void 0 ? void 0 : _e.name];
            case 8: return [2 /*return*/, element.created_time];
            case 9: return [2 /*return*/, element.last_edited_time];
            case 10: return [2 /*return*/, element.email];
            case 11: return [2 /*return*/, element.status];
            case 12: return [2 /*return*/, element.phone_number];
            case 13: return [2 /*return*/, element.relation.map(function (item) { return item.id; })];
            case 14: return [2 /*return*/, element.multi_select.map(function (item) { return item.name; })];
            case 15:
                url = ((_f = element.files[0]) === null || _f === void 0 ? void 0 : _f.url) || ((_h = (_g = element.files[0]) === null || _g === void 0 ? void 0 : _g.file) === null || _h === void 0 ? void 0 : _h.url);
                if (!url) {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, manageImage(properties, url, contentType, (_j = element.files[0]) === null || _j === void 0 ? void 0 : _j.name)];
            case 16: return [2 /*return*/, _k.sent()];
            case 17: throw new Error("Unknown type ".concat(type));
        }
    });
}); };
var toFrontMatter = function (data) { return '---\n' + yaml.stringify(data) + '\n---\n'; };
function wget(url, dest) {
    return new Promise(function (res) {
        http.get(url, function (response) {
            if (response.statusCode == 302) {
                // if the response is a redirection, we call again the method with the new location
                console.log('redirecting to ', response.headers.location);
                wget(String(response.headers.location), dest);
            }
            else {
                console.log('Downloading', url, 'to', dest);
                var file_1 = fs.createWriteStream(dest);
                response.pipe(file_1);
                file_1.on('finish', function () {
                    file_1.close();
                    res();
                });
            }
        });
    });
}
var parseNotionPage = function (page, contentType, debug) {
    if (debug === void 0) { debug = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var obj, _a, _b, _c, _i, field, value;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    obj = {
                        notionId: page.id,
                        type: contentType,
                    };
                    if (!('properties' in page)) return [3 /*break*/, 4];
                    _a = (page.properties || {});
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _i = 0;
                    _d.label = 1;
                case 1:
                    if (!(_i < _b.length)) return [3 /*break*/, 4];
                    _c = _b[_i];
                    if (!(_c in _a)) return [3 /*break*/, 3];
                    field = _c;
                    if (debug) {
                        console.log("Fetching ".concat(field));
                    }
                    return [4 /*yield*/, getFieldInfo(page.properties, field, contentType)];
                case 2:
                    value = _d.sent();
                    if (value !== null && value !== undefined && !obj[field]) {
                        obj[field] = value;
                    }
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, obj];
            }
        });
    });
};
exports.parseNotionPage = parseNotionPage;
var checkFolder = function (dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};
var getDatabase = function (notion, database_id, contentType, debug) {
    if (debug === void 0) { debug = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var request, results, ret, _i, results_1, page, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, notion.databases.query({
                        database_id: database_id,
                    })];
                case 1:
                    request = _a.sent();
                    results = request.results;
                    ret = [];
                    if (debug) {
                        console.log("Got ".concat(results.length, " results from ").concat(contentType, " database"));
                    }
                    _i = 0, results_1 = results;
                    _a.label = 2;
                case 2:
                    if (!(_i < results_1.length)) return [3 /*break*/, 5];
                    page = results_1[_i];
                    return [4 /*yield*/, (0, exports.parseNotionPage)(page, contentType, debug)];
                case 3:
                    item = _a.sent();
                    ret.push(item);
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, ret];
            }
        });
    });
};
var saveFile = function (frontMatter, type, languageField) { return __awaiter(void 0, void 0, void 0, function () {
    var notionId, lang, title, slug, mdblocks, imageBlocks, images, imagePath, _i, imageBlocks_1, block, data, url, name_1, filename, src, file, mdBody, _a, images_1, image, newFile;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!n2m) {
                    throw new Error('Notion client not set');
                }
                notionId = frontMatter['notionId'];
                lang = languageField ? frontMatter[languageField] : '';
                title = frontMatter['title'];
                if (!title && !frontMatter['slug']) {
                    throw new Error("No title or slug in front matter for ".concat(notionId, " of type ").concat(type));
                }
                slug = frontMatter['slug'] || slugify(title, {
                    lower: true,
                    strict: true,
                });
                frontMatter['slug'] = slug;
                return [4 /*yield*/, n2m.pageToMarkdown(notionId)];
            case 1:
                mdblocks = _b.sent();
                imageBlocks = mdblocks.filter(function (block) { return block.type === 'image'; }).map(function (block) { return block.parent; });
                images = [];
                imagePath = (0, fileManagement_1.getImageFolderPath)(slug, type);
                checkFolder('./public' + imagePath);
                _i = 0, imageBlocks_1 = imageBlocks;
                _b.label = 2;
            case 2:
                if (!(_i < imageBlocks_1.length)) return [3 /*break*/, 6];
                block = imageBlocks_1[_i];
                data = block.replace('![', '').replace(']', '').replace(')', '').split('(');
                if (data.length !== 2) {
                    console.log('Error with image block: ', block);
                    return [3 /*break*/, 5];
                }
                url = data[1];
                name_1 = data[0];
                filename = name_1.split('/').pop();
                src = imagePath + filename;
                file = "./public/".concat(src);
                if (!!fs.existsSync(file)) return [3 /*break*/, 4];
                return [4 /*yield*/, wget(url, file)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                images.push({
                    src: src,
                    url: url,
                    name: name_1
                });
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6:
                mdBody = n2m.toMarkdownString(mdblocks);
                for (_a = 0, images_1 = images; _a < images_1.length; _a++) {
                    image = images_1[_a];
                    mdBody.parent = mdBody.parent.replace(image.url, image.src);
                }
                newFile = (0, fileManagement_1.getFilePath)(slug, type, lang);
                try {
                    fs.writeFileSync(newFile, toFrontMatter(frontMatter) + mdBody.parent);
                }
                catch (e) {
                    console.log('error with file: ', newFile);
                    console.error(e);
                }
                return [2 /*return*/];
        }
    });
}); };
var parseNotion = function (token, contentRoot, contentTypes, debug) {
    if (debug === void 0) { debug = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _i, contentTypes_1, type, databaseId, lang, contentType, database, _a, database_1, page, _b, _c, field;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (debug) {
                        console.log('Setting up Notion client');
                    }
                    setNotionSecret(token);
                    addDocumentTypes(contentTypes);
                    if (!notionClient) {
                        throw new Error('Notion client incorretly setup');
                    }
                    else {
                        if (debug) {
                            console.log('Notion client setup');
                        }
                    }
                    _i = 0, contentTypes_1 = contentTypes;
                    _d.label = 1;
                case 1:
                    if (!(_i < contentTypes_1.length)) return [3 /*break*/, 7];
                    type = contentTypes_1[_i];
                    databaseId = type.databaseId;
                    lang = type.languageField;
                    contentType = type.contentType || databaseId;
                    if (!databaseId) {
                        throw new Error('No database id for type ' + type.contentType);
                    }
                    if (!contentType) {
                        throw new Error('contentType id missing');
                    }
                    return [4 /*yield*/, getDatabase(notionClient, databaseId, contentType, debug)];
                case 2:
                    database = _d.sent();
                    if (!database.length) {
                        console.error("Got ".concat(database.length, " items from ").concat(contentType, " database"));
                    }
                    _a = 0, database_1 = database;
                    _d.label = 3;
                case 3:
                    if (!(_a < database_1.length)) return [3 /*break*/, 6];
                    page = database_1[_a];
                    sleep(400);
                    for (_b = 0, _c = (type.filterFields || []); _b < _c.length; _b++) {
                        field = _c[_b];
                        if (page[field]) {
                            delete page[field];
                        }
                    }
                    return [4 /*yield*/, saveFile(page, contentType, lang)];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    _a++;
                    return [3 /*break*/, 3];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.parseNotion = parseNotion;
