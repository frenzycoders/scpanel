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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = exports.rename = exports.copyEntity = exports.readFile = exports.deleteEntity = exports.createFile = exports.createFolder = exports.readDir = exports.basicInfo = exports.logoutUser = exports.loginUser = exports.testHost = exports.getUser = exports.secret = exports.access = void 0;
const server_1 = require("./../../models/server");
const user_1 = require("./../../models/user");
const token_1 = require("./../../models/token");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const check_disk_space_1 = __importDefault(require("check-disk-space"));
const os_1 = require("os");
const promises_1 = require("fs/promises");
const graceful_fs_1 = require("graceful-fs");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
exports.access = 'someassess';
exports.secret = 'this is secret of my server';
const genToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token = (0, jsonwebtoken_1.sign)({ email: user.email, access: exports.access }, exports.secret, { expiresIn: 60 * 60 * 24 * 7 });
        let t = yield token_1.Token.create({ token: token, user: user }).save();
        return t;
    }
    catch (error) {
        throw error;
    }
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.user.password = undefined;
    res.status(200).send({ user: req.user, token: req.token });
});
exports.getUser = getUser;
const testHost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { ip, port, protocol } = req.body;
        let user = yield user_1.User.findOne({ where: { id: 'user' } });
        let server = yield server_1.Server.findOne({ where: { user: user } });
        if (server) {
            server.ip = ip;
        }
        user.password = undefined;
        res.status(200).send({ user, server, protocol });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.testHost = testHost;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { password } = req.body;
        let user = yield user_1.User.findOne({ where: { id: 'user' } });
        let isValid = yield (0, bcryptjs_1.compare)(password, user.password);
        if (!isValid)
            return res.status(500).send('wrong password please try again');
        let token = yield genToken(user);
        res.status(200).send({ user: token });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.loginUser = loginUser;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield token_1.Token.delete({ token: req.token });
        res.status(200).send('logged out');
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.logoutUser = logoutUser;
const basicInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let value = yield (0, check_disk_space_1.default)(process.platform == 'win32' ? 'C:/' : '/');
        let sysInfo = { arch: (0, os_1.arch)(), freeMemory: (0, os_1.freemem)(), homeDir: (0, os_1.homedir)(), platform: (0, os_1.platform)(), ostype: (0, os_1.type)(), totalMemory: (0, os_1.totalmem)(), uptime: (0, os_1.uptime)(), hostname: (0, os_1.hostname)(), totalStorage: value.size / (1024 * 1024 * 1024), freeStorage: value.free / (1024 * 1024 * 1024), diskPath: value.diskPath };
        res.status(200).send(sysInfo);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.basicInfo = basicInfo;
const readDir = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let path = req.query.path || (0, os_1.homedir)();
        let { hidden } = req.query;
        let dirs = [];
        let d = yield (0, promises_1.readdir)(path.toString(), { withFileTypes: true });
        if (d.length == 0)
            return res.status(200).send({ dirs, length: dirs.length });
        d.map((e) => {
            if (hidden == 'true')
                dirs.push({ name: e.name, isFolder: e.isDirectory(), path: path != '/' ? path + '/' + e.name : '/' + e.name });
            else if (e.name[0] != '.')
                dirs.push({ name: e.name, isFolder: e.isDirectory(), path: path != '/' ? path + '/' + e.name : '/' + e.name });
        });
        res.status(200).send({ dirs, length: dirs.length });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.readDir = readDir;
const createFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let path = ((_a = req.query.path) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        let state = yield (0, promises_1.stat)(path);
        if (state.isFile()) {
            return res.status(500).send('path is file type please enter correct path');
        }
        else if (state.isDirectory()) {
            yield (0, promises_1.mkdir)(path == '/' ? '/' + req.query.folderName : path + '/' + req.query.folderName, { recursive: true });
            return res.status(200).send('folder create with path [' + path + '/' + req.query.folderName + ']');
        }
        else
            return res.status(500).send('path not found');
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.createFolder = createFolder;
const createFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        if (!req.query.path || !req.body.data || !req.query.fileName)
            return res.status(404).send('please add path and data to query and body');
        let path = req.query.path.toString();
        let state = yield (0, promises_1.stat)(path);
        if (state.isFile()) {
            return res.status(500).send('path is file type please enter correct path');
        }
        else if (state.isDirectory()) {
            path = path == '/' ? '/' + ((_b = req.query.fileName) === null || _b === void 0 ? void 0 : _b.toString()) : path + '/' + req.query.fileName;
            (0, fs_1.writeFileSync)(path, req.body.data);
            return res.status(200).send('file create with path [' + path + '/' + req.query.fileName + ']');
        }
        else
            return res.status(500).send('path not found');
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.createFile = createFile;
const deleteEntity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { path } = req.query;
        if (!path)
            return res.status(404).send('please add file path to query');
        else {
            let state = yield (0, promises_1.stat)(path.toString());
            if (state.isDirectory()) {
                yield (0, promises_1.rmdir)(path.toString(), { recursive: true, maxRetries: 3 });
                return res.status(200).send('directory with path [' + path + '] was deleted');
            }
            else if (state.isFile()) {
                yield (0, promises_1.unlink)(path.toString());
                return res.status(200).send('file with path [' + path + '] was deleted');
            }
            else
                return res.status(500).send('something went wrong this path is not file or folder type');
        }
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.deleteEntity = deleteEntity;
const readFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { path } = req.query;
        if (!path)
            return res.status(404).send('path not found');
        else {
            let state = yield (0, promises_1.stat)(path.toString());
            if (state.isFile()) {
                let data = (0, graceful_fs_1.readFileSync)(path.toString(), { encoding: 'utf-8' });
                return res.status(200).send({ path: path, data: data });
            }
            else
                res.status(500).send('this path is not a file');
        }
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.readFile = readFile;
const copyEntity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { source, destination } = req.query;
        if (!source || !destination)
            return res.status(404).send('Please add source and destination');
        yield (0, promises_1.stat)(source.toString());
        let pbState = yield (0, promises_1.stat)(destination.toString());
        if (!pbState.isDirectory())
            return res.status(404).send("destenation expected as directory but got file");
        let fileName = source.toString().split('/')[source.toString().split('/').length - 1];
        (0, fs_extra_1.copySync)(source.toString(), destination.toString() + '/' + fileName);
        res.status(200).send('copied ' + source + ' to ' + destination);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.copyEntity = copyEntity;
const rename = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { path, newName } = req.query;
        if (!path || !newName)
            return res.status(404).send('Please enter query details');
        let oldPath = path === null || path === void 0 ? void 0 : path.toString();
        let state = yield (0, promises_1.stat)(oldPath);
        let pathArr = oldPath.split('/');
        pathArr[pathArr.length - 1] = newName.toString();
        let newPath = pathArr.join('/');
        (0, fs_1.renameSync)(oldPath, newPath);
        res.status(200).send('path renamed');
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.rename = rename;
const move = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { source, destination } = req.query;
        if (!source || !destination)
            return res.status(404).send('source and destination not found in query');
        let sourceState = yield (0, promises_1.stat)(source.toString());
        let destState = yield (0, promises_1.stat)(destination.toString());
        if (!destState.isDirectory())
            return res.status(404).send('distination is not folder');
        let fileName = source.toString().split('/')[source.toString().split('/').length - 1];
        (0, fs_extra_1.moveSync)(source.toString(), destination.toString() + '/' + fileName);
        res.status(200).send('copied ' + source + ' to ' + destination);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.move = move;
//# sourceMappingURL=user.service.js.map