#!/usr/bin/env node
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
exports.logUser = exports.main = exports.getPubIp = exports.notfound = exports.help = exports.stopServer = exports.serverStatus = exports.startServer = exports.changepsswd = exports.removeUser = exports.userDetails = exports.setupServer = exports.spinner = void 0;
const process_1 = require("process");
const pm2_1 = __importDefault(require("pm2"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const os_1 = require("os");
const cli_spinner_1 = require("cli-spinner");
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const axios_1 = __importDefault(require("axios"));
const connection_1 = require("./src/connection");
const user_1 = require("./src/models/user");
const bcryptjs_1 = require("bcryptjs");
const server_1 = require("./src/models/server");
const package_json_1 = require("./package.json");
exports.spinner = new cli_spinner_1.Spinner({
    stream: process.stderr,
    onTick: function (msg) {
        this.clearLine(this.stream);
        this.stream.write(msg);
    }
});
exports.spinner.setSpinnerString('|/-\\');
const log = console.log;
const exitProcess = () => {
    log(chalk_1.default.yellow('> [info]: ') + chalk_1.default.yellow('exit'));
    process.exit(0);
};
const setupServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield user_1.User.findOne({ where: { id: 'user' } });
        if (user == null) {
            log(chalk_1.default.green('> [info]: ') + chalk_1.default.bold.blue('welcome sir, please provide us some details'));
            let name = readline_sync_1.default.question('> Your Name: ');
            let email = readline_sync_1.default.questionEMail('> Your Email: ');
            let password = readline_sync_1.default.questionNewPassword('> Your Password: ', { hideEchoBack: true, cancel: true, min: 6, max: 12, });
            log(chalk_1.default.bold.greenBright('> Please wait while we are setting up scpanle for you: '));
            exports.spinner.start();
            password = yield (0, bcryptjs_1.hash)(password, yield (0, bcryptjs_1.genSalt)(8));
            const createdUser = user_1.User.create({
                id: 'user',
                name: name,
                host_user: (0, os_1.userInfo)().username,
                email: email,
                password: password,
            });
            yield createdUser.save();
            exports.spinner.stop(true);
            log(chalk_1.default.green('> [OK] :') + chalk_1.default.gray('user with name ') + chalk_1.default.bold.green(createdUser === null || createdUser === void 0 ? void 0 : createdUser.name) + chalk_1.default.gray(' and email ') + chalk_1.default.bold.green(createdUser === null || createdUser === void 0 ? void 0 : createdUser.email) + chalk_1.default.gray(' is created.'));
            log(chalk_1.default.yellow('> now you can access your server using scpanel web/mobile/desktop from anywere and anytime'));
            log(chalk_1.default.bold.gray('> Click here to login: ') + chalk_1.default.bold.green('https://scpanel.bytecodes.club'));
            (0, exports.logUser)(createdUser);
        }
        else {
            (0, exports.logUser)(user);
            var ans = readline_sync_1.default.question('> Setup for user ' + chalk_1.default.bold.greenBright(user.name) + ' with email ' + chalk_1.default.bold.greenBright(user.email) + ' is already found. Want to reset it ? (Y/N) : ');
            if (ans.toLowerCase() == 'y' || ans.toLowerCase() == 'yes') {
                log(chalk_1.default.bold.green('> [process]: ') + chalk_1.default.grey('checking server status'));
                exports.spinner.start();
                let server = yield server_1.Server.findOne({ where: { user: user } });
                if (!server) {
                    log(chalk_1.default.red('> [OK]: ') + chalk_1.default.bold.blue('server configuration not found'));
                    log(chalk_1.default.green('> [info]: ') + chalk_1.default.bold.greenBright('you have to start server after that you can reset your setup.'));
                    log(chalk_1.default.green('> [help]: ') + chalk_1.default.bold.blue('run ') + chalk_1.default.bold.grey('scpanel start') + chalk_1.default.bold.blue(' for start or init server'));
                }
                else {
                    log(chalk_1.default.green('> [status]: ') + chalk_1.default.blue('server configuration find with this user'));
                    log(chalk_1.default.green('> [process]: ') + chalk_1.default.grey('please wait while we are deleting server configuration'));
                    if (server.status == true) {
                        pm2_1.default.delete('my-server', (err) => {
                            if (err) {
                                log(chalk_1.default.red('> [error]: error from pm2'));
                                log(chalk_1.default.red(err));
                            }
                            else {
                                log(chalk_1.default.blue('> [stop]: ') + chalk_1.default.yellow('shutting down server'));
                                pm2_1.default.disconnect();
                            }
                        });
                    }
                    else {
                        log(chalk_1.default.green('> [OK]: ') + chalk_1.default.grey('server is not running'));
                    }
                    yield server_1.Server.delete({});
                }
                log(chalk_1.default.green('> [sucess]: ') + chalk_1.default.blue('server removed'));
                exports.spinner.stop(true);
                log(chalk_1.default.bold.redBright('> Please wait while we are removing your profile'));
                exports.spinner.start();
                yield user_1.User.delete({});
                exports.spinner.stop(true);
                console.log(chalk_1.default.green('[OK]: ') + chalk_1.default.grey('user with name ') + chalk_1.default.bold.red(user.name) + chalk_1.default.gray(' and email ') + chalk_1.default.bold.red(user.email) + chalk_1.default.grey(' is removed.'));
                yield (0, exports.setupServer)();
            }
        }
        return user;
    }
    catch (error) {
        exports.spinner.stop();
        log(chalk_1.default.red(error));
        exitProcess();
    }
});
exports.setupServer = setupServer;
const userDetails = () => __awaiter(void 0, void 0, void 0, function* () {
    log(chalk_1.default.green('> [process]: ') + chalk_1.default.bold.grey('wait while we are getting your account details'));
    exports.spinner.start();
    try {
        let user = yield user_1.User.findOne({
            where: {
                id: 'user'
            }
        });
        exports.spinner.stop(true);
        if (!user) {
            log(chalk_1.default.yellow('> [info]: ') + chalk_1.default.green('Account info not found'));
            log(chalk_1.default.red('> [error]: ') + chalk_1.default.grey('user info not exist please setup your server ') + chalk_1.default.bold.greenBright('scpanel setup'));
        }
        else {
            log(chalk_1.default.green('> [OK]: ') + chalk_1.default.green('Logging account details with password'));
            (0, exports.logUser)(user);
        }
    }
    catch (error) {
        exports.spinner.stop();
        log(chalk_1.default.red(error));
        exitProcess();
    }
});
exports.userDetails = userDetails;
const removeUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield user_1.User.findOne({ where: { id: 'user' } });
        if (!user) {
            log(chalk_1.default.redBright('> [error]: ') + chalk_1.default.red('user profile not found please setup your profile first'));
            log(chalk_1.default.blue('> [info]: ') + chalk_1.default.green('run ') + chalk_1.default.grey('scpanel setup ') + chalk_1.default.green('for setup your profile'));
        }
        else {
            log(chalk_1.default.yellow('> [warning]: ') + chalk_1.default.blue('this will remove your account info.'));
            var ans = readline_sync_1.default.question(chalk_1.default.bold.redBright('> are you sure? (y/n) : ') + chalk_1.default.gray('[default: n]: '));
            if (ans.toLowerCase() == 'y' || ans.toLowerCase() == 'yes') {
                log(chalk_1.default.bold.green('> [process]: ') + chalk_1.default.grey('checking server status'));
                exports.spinner.start();
                let server = yield server_1.Server.findOne({ where: { user: user } });
                if (!server) {
                    log(chalk_1.default.red('> [OK]: ') + chalk_1.default.bold.blue('server configuration not found'));
                    log(chalk_1.default.green('> [info]: ') + chalk_1.default.bold.greenBright('you have to start server after that you can reset your setup.'));
                    log(chalk_1.default.green('> [help]: ') + chalk_1.default.bold.blue('run ') + chalk_1.default.bold.grey('scpanel start') + chalk_1.default.bold.blue(' for start or init server'));
                }
                else {
                    log(chalk_1.default.green('> [status]: ') + chalk_1.default.blue('server configuration find with this user'));
                    log(chalk_1.default.green('> [process]: ') + chalk_1.default.grey('please wait while we are deleting server configuration'));
                    if (server.status == true) {
                        pm2_1.default.delete('my-server', (err) => {
                            if (err) {
                                log(chalk_1.default.red('> [error]: error from pm2'));
                                log(chalk_1.default.red(err));
                            }
                            else {
                                log(chalk_1.default.blue('> [stop]: ') + chalk_1.default.yellow('shutting down server'));
                                pm2_1.default.disconnect();
                            }
                        });
                    }
                    else {
                        log(chalk_1.default.green('> [OK]: ') + chalk_1.default.grey('server is not running'));
                    }
                }
                yield server_1.Server.delete({});
                log(chalk_1.default.green('> [sucess]: ') + chalk_1.default.blue('server removed'));
                exports.spinner.stop(true);
                log(chalk_1.default.green('> [process]: ') + chalk_1.default.redBright('Please wait while we are removing your account info.'));
                exports.spinner.start();
                yield user_1.User.delete({});
                exports.spinner.stop(true);
                log(chalk_1.default.green('> [OK]: ') + chalk_1.default.green('Account info removed.'));
                log(chalk_1.default.yellow('> [info]: ') + chalk_1.default.gray('run command for setup ') + chalk_1.default.green('scpanel setup'));
            }
            else {
                log(chalk_1.default.green('> [OK]: ') + chalk_1.default.gray('exiting'));
            }
        }
    }
    catch (error) {
        log(chalk_1.default.red('> [error]: ') + chalk_1.default.bold.redBright('error with databse'));
        log(chalk_1.default.red(error.message));
        exitProcess();
    }
});
exports.removeUser = removeUser;
const changepsswd = () => __awaiter(void 0, void 0, void 0, function* () {
    log(chalk_1.default.green('> [process]: ') + chalk_1.default.bold.grey('wait while we are getting your account details'));
    exports.spinner.start();
    let user = yield user_1.User.findOne({ where: { id: 'user' } });
    exports.spinner.stop(true);
    if (!user) {
        log(chalk_1.default.yellow('> [info]: ') + chalk_1.default.green('Account info not found'));
        log(chalk_1.default.red('> [error]: ') + chalk_1.default.grey('user info not exist please setup your server ') + chalk_1.default.bold.greenBright('scpanel setup'));
    }
    else {
        try {
            log(chalk_1.default.green('> [OK]: ') + chalk_1.default.green('Logging account details with password'));
            (0, exports.logUser)(user);
            var password = readline_sync_1.default.questionNewPassword(chalk_1.default.green('> New password: '), { hideEchoBack: true, cancel: true, min: 6, max: 12 });
            log(chalk_1.default.green('> [process]: ') + chalk_1.default.grey('please wait while we are updating your password '));
            exports.spinner.start();
            password = yield (0, bcryptjs_1.hash)(password, yield (0, bcryptjs_1.genSalt)(8));
            user.password = password;
            yield user_1.User.update({
                id: 'user'
            }, { password: password });
            exports.spinner.stop(true);
            log(chalk_1.default.green('> [OK]: ') + chalk_1.default.green('password updated'));
            log(chalk_1.default.yellow('> logging account details with new password'));
            (0, exports.logUser)(user);
        }
        catch (error) {
            log(chalk_1.default.red('[error]: ') + chalk_1.default.redBright(error));
            exitProcess();
        }
    }
});
exports.changepsswd = changepsswd;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    log(chalk_1.default.green('> [process]: ') + chalk_1.default.blue('starting server'));
    exports.spinner.start();
    try {
        let user = yield user_1.User.findOne({ where: { id: 'user' } });
        if (!user) {
            exports.spinner.stop(true);
            log(chalk_1.default.red('> [error]: ') + chalk_1.default.blue('please setup your server first by runnig') + chalk_1.default.greenBright(' scpanel setup'));
            exports.spinner.stop(true);
        }
        else {
            pm2_1.default.start({ name: 'my-server', script: __dirname + '/src/server.js' }, (err) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    exports.spinner.stop(true);
                    pm2_1.default.disconnect();
                    log(chalk_1.default.red('> [error]: ') + chalk_1.default.grey('server deployment error.'));
                    log(chalk_1.default.red(err));
                }
                else {
                    exports.spinner.stop(true);
                    pm2_1.default.disconnect();
                    log(chalk_1.default.greenBright('> [OK]: ') + chalk_1.default.green('server is up and running '));
                    log(chalk_1.default.yellow('> [info]: ') + chalk_1.default.grey('go to http://scpanel.bytecodes.club and access your server manager'));
                    log(chalk_1.default.bold.blue('> [info]: ') + chalk_1.default.green('run ') + chalk_1.default.bold.blue('scpanel status ') + chalk_1.default.green('for ip and port which used for login'));
                }
            }));
        }
    }
    catch (error) {
        exports.spinner.stop(true);
        log(chalk_1.default.red('> [error]: '), chalk_1.default.redBright(error));
        exitProcess();
    }
});
exports.startServer = startServer;
const serverStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    log(chalk_1.default.green('> [process]: ') + chalk_1.default.blue('please wait while we are getting server data'));
    exports.spinner.start();
    try {
        let user = yield user_1.User.findOne({ where: { id: 'user' } });
        if (!user) {
            exports.spinner.stop(true);
            log(chalk_1.default.redBright('> [error]: ') + chalk_1.default.gray('please setup your server first by running ') + chalk_1.default.green('scpanel setup'));
        }
        else {
            log(chalk_1.default.green('> [running]: ') + chalk_1.default.gray('loading server data with user email: ') + chalk_1.default.green(user === null || user === void 0 ? void 0 : user.email));
            let server = yield server_1.Server.findOne({ where: { user: user } });
            if (!server) {
                exports.spinner.stop(true);
                log(chalk_1.default.redBright('> [error]: ') + chalk_1.default.red('please start server by running') + chalk_1.default.grey(' scpanel start '));
            }
            else {
                exports.spinner.stop(true);
                log(server.status ? chalk_1.default.green('> [OK]: ') + chalk_1.default.gray('server is ') + chalk_1.default.bold.greenBright('running') : chalk_1.default.red('> [OK]: ') + chalk_1.default.grey('server is ') + chalk_1.default.bold.redBright('not running'));
                if (server.status) {
                    log(chalk_1.default.bold.blue('> [info]: ') + chalk_1.default.green('your ip: ') + chalk_1.default.grey(server === null || server === void 0 ? void 0 : server.ip) + chalk_1.default.green(' port ') + chalk_1.default.grey(server === null || server === void 0 ? void 0 : server.port) + chalk_1.default.green(' password ') + chalk_1.default.grey(user === null || user === void 0 ? void 0 : user.password));
                }
            }
        }
    }
    catch (error) {
        log(chalk_1.default.red('> [error]: ') + chalk_1.default.grey('error in getting data from database'));
        log(chalk_1.default.red(error));
        exitProcess();
    }
});
exports.serverStatus = serverStatus;
const stopServer = () => __awaiter(void 0, void 0, void 0, function* () {
    log(chalk_1.default.green('> [process]: ') + chalk_1.default.blue('stopping server'));
    exports.spinner.start();
    try {
        let user = yield user_1.User.findOne({ where: { id: 'user' } });
        if (!user) {
            exports.spinner.stop(true);
            log(chalk_1.default.redBright('> [error]: ') + chalk_1.default.gray('please setup your server first by running ') + chalk_1.default.green('scpanel setup'));
        }
        else {
            log(chalk_1.default.green('> [running]: ') + chalk_1.default.gray('loading server data with user email: ') + chalk_1.default.green(user === null || user === void 0 ? void 0 : user.email));
            let server = yield server_1.Server.findOne({ where: { user: user } });
            if (!server) {
                pm2_1.default.delete('my-server', (err) => {
                    pm2_1.default.disconnect();
                });
                exports.spinner.stop(true);
                log(chalk_1.default.redBright('> [error]: ') + chalk_1.default.red('please start server by running'));
            }
            else {
                pm2_1.default.delete('my-server', (err) => {
                    pm2_1.default.disconnect();
                });
                yield server_1.Server.update({
                    user: user
                }, {
                    status: false
                });
                exports.spinner.stop(true);
                log(chalk_1.default.green('> [OK]: ') + chalk_1.default.gray('server ') + chalk_1.default.bold.redBright('stopped'));
            }
        }
    }
    catch (error) {
        exports.spinner.stop(true);
        log(chalk_1.default.redBright('> [error]: error in stopping server'));
        log(chalk_1.default.red(error));
        exitProcess();
    }
});
exports.stopServer = stopServer;
const help = () => {
    log(chalk_1.default.green('> [info]: ') + chalk_1.default.blue('try this'));
    log(chalk_1.default.green('> [info]: ') + chalk_1.default.blue('commands') + chalk_1.default.grey(' \n> [scpanel setup ') + chalk_1.default.green('use for setup profile ]') + chalk_1.default.grey(' \n> [scpanel userdetails ') + chalk_1.default.green('use for get user profile details ]') + chalk_1.default.grey(' \n> [scpanel removeuser ') + chalk_1.default.green('use for remove user profile ]') + chalk_1.default.grey(' \n> [scpanle changepsswd ') + chalk_1.default.green('use for change login password for user ]') + chalk_1.default.grey(' \n> [scpanel start ') + chalk_1.default.green('use for start server ]') + chalk_1.default.grey(' \n> [scpanle stop ') + chalk_1.default.green('use for stop server ]') + chalk_1.default.grey(' \n> [scpanle status ') + chalk_1.default.green('use for check status of server is running or not ]') + chalk_1.default.grey(' \n> [scpanle mypubip ') + chalk_1.default.green('use for get your public ip ]') + chalk_1.default.grey(' \n> [scpanle help ') + chalk_1.default.green('use for get list of usefull commands ]'));
};
exports.help = help;
const notfound = (args) => {
    log(chalk_1.default.redBright('> [error]: ') + chalk_1.default.blueBright('invalid argument ') + chalk_1.default.bold.grey(args));
    (0, exports.help)();
};
exports.notfound = notfound;
const getPubIp = () => __awaiter(void 0, void 0, void 0, function* () {
    log(chalk_1.default.green('> [process]: ') + chalk_1.default.blue('please wait while we are getting your public ip'));
    exports.spinner.start();
    try {
        var res = yield (0, axios_1.default)({ method: 'GET', url: 'https://api.ipify.org/' });
        exports.spinner.stop(true);
        if (res.status == 200) {
            log(chalk_1.default.green('> [OK]: ') + chalk_1.default.blue('your public ip is : ') + chalk_1.default.grey(`[${res.data}]`));
        }
    }
    catch (error) {
        exports.spinner.stop(true);
        log(chalk_1.default.redBright('> [error]: ') + chalk_1.default.red(error.message));
        exitProcess();
    }
});
exports.getPubIp = getPubIp;
const main = (args) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, connection_1.dbConnection)();
    if (args == 'setup') {
        yield (0, exports.setupServer)();
    }
    else if (args == 'userinfo') {
        yield (0, exports.userDetails)();
    }
    else if (args == 'removeuser') {
        yield (0, exports.removeUser)();
    }
    else if (args == 'changepsswd') {
        yield (0, exports.changepsswd)();
    }
    else if (args == 'start') {
        yield (0, exports.startServer)();
    }
    else if (args == 'status') {
        yield (0, exports.serverStatus)();
    }
    else if (args == 'stop') {
        yield (0, exports.stopServer)();
    }
    else if (args == 'mypubip') {
        yield (0, exports.getPubIp)();
    }
    else if (args == 'help') {
        (0, exports.help)();
    }
    else if (args.toLowerCase() == 'v' || args.toLowerCase() == 'version') {
        log(chalk_1.default.green('> [version]: ') + chalk_1.default.blue(package_json_1.version));
    }
    else {
        (0, exports.notfound)(args);
    }
});
exports.main = main;
if (process_1.argv.length > 2) {
    (0, exports.main)(process_1.argv[process_1.argv.length - 1]);
}
else {
    log(chalk_1.default.red('[error]: ') + chalk_1.default.grey('Please enter valid arguments or check setup documentation'));
}
const logUser = (user) => {
    if (!user)
        console.log('user not found');
    var table = new cli_table3_1.default({
        chars: {
            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
            'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
            'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
            'right': '║', 'right-mid': '╢', 'middle': '│'
        },
        head: ["id", "name", "hostname", "email", "password"],
    });
    table.push([user.id, user.name, user.host_user, user.email, user.password]);
    log(table.toString());
};
exports.logUser = logUser;
//# sourceMappingURL=index.js.map