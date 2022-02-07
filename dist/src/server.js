"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const fs_1 = __importStar(require("fs"));
const graceful_fs_1 = require("graceful-fs");
const chalk_1 = __importDefault(require("chalk"));
const user_controller_1 = require("./api/controller/user.controller");
const dotenv_1 = require("dotenv");
const axios_1 = __importDefault(require("axios"));
const connection_1 = require("./connection");
const user_1 = require("./models/user");
const server_1 = require("./models/server");
const os_1 = require("os");
const cors_1 = __importDefault(require("cors"));
let pubIp = null;
(0, graceful_fs_1.gracefulify)(fs_1.default);
(0, connection_1.dbConnection)();
console.log(chalk_1.default.green('> [process]: ') + chalk_1.default.bold.grey('loading data from .env'));
(0, dotenv_1.config)();
console.log(chalk_1.default.green('> [OK]: ') + chalk_1.default.bold.gray('data loaded'));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const myserver = (0, http_1.createServer)(app);
const PORT = process.env.SERVER_PORT || 8080;
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let start = Date.now();
    req.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
        let end = Date.now();
        let val = { "method": req.method, "time": end - start + 'ms', "path": req.path, "date": Date.now().toString() };
        console.log(chalk_1.default.green('> [logs]: ') + chalk_1.default.gray(' method: ') + chalk_1.default.greenBright(val.method) + chalk_1.default.grey(' path: ') + chalk_1.default.greenBright(val.path) + chalk_1.default.grey(' time: ') + chalk_1.default.greenBright(val.time));
        if (fs_1.default.existsSync(__dirname + '/server.logs')) {
            (0, fs_1.appendFileSync)(__dirname + '/server.logs', JSON.stringify(val) + '\n');
        }
        else {
            fs_1.default.writeFileSync(__dirname + '/server.logs', JSON.stringify(val) + '\n');
        }
    }));
    next();
}));
app.use('/user', user_controller_1.userController);
console.log(chalk_1.default.green('> [process]: ') + chalk_1.default.bold.gray('starting server'));
myserver.listen({ port: PORT }, () => __awaiter(void 0, void 0, void 0, function* () {
    const details = myserver.address();
    console.log(chalk_1.default.bold.green('> [OK]: ') + chalk_1.default.yellow('server started at ') + chalk_1.default.bold.gray(details.address == '::' ? 'http://127.0.0.1:' + details.port : details.address + ':' + details.port));
    yield changeServerStatue(details);
    console.log(chalk_1.default.bold.gray('> family: ') + chalk_1.default.green(details.family));
    console.log(chalk_1.default.green('> [public ip]: ') + chalk_1.default.blue(pubIp));
}));
const changeServerStatue = (details) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var res = yield (0, axios_1.default)({ method: 'GET', url: 'https://api.ipify.org/' });
        if (res.status == 200) {
            pubIp = res.data;
        }
    }
    catch (error) {
        console.log(error);
    }
    let user = yield user_1.User.findOne({ where: { id: 'user' } });
    if (!user) {
        console.log(chalk_1.default.redBright('> [error]: ') + chalk_1.default.red('please setup your profile first'));
        console.log(chalk_1.default.green('> [info]: ') + chalk_1.default.blue('run ') + chalk_1.default.grey('scpanel setup ') + chalk_1.default.blue('for setup your profile'));
        process.exit(0);
    }
    let server = yield server_1.Server.findOne({ where: { user: user } });
    if (!server) {
        yield server_1.Server.create({
            error: false,
            ip: pubIp,
            port: details.port.toString(),
            status: true,
            email: user.email,
            user: user,
            homeDir: (0, os_1.homedir)()
        }).save();
    }
    else {
        yield server_1.Server.update({ user: user }, {
            error: false,
            ip: pubIp,
            port: details.port.toString(),
            status: true,
            email: user.email,
            homeDir: (0, os_1.homedir)()
        });
    }
});
//# sourceMappingURL=server.js.map