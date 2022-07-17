#!/usr/bin/env node
import { argv } from 'process';
import pm2 from 'pm2';
import readlineSync from 'readline-sync';
import { userInfo } from 'os';
import { Spinner } from 'cli-spinner';
import chalk from 'chalk';
import Table from 'cli-table3';
import axios, { AxiosResponse } from 'axios';
import { dbConnection } from './src/connection';
import { User } from './src/models/user';
import { Token } from './src/models/token';
import { genSalt, hash } from 'bcryptjs';
import { Server } from './src/models/server';
import { version } from './package.json'

export const spinner = new Spinner({
    stream: process.stderr,
    onTick: function (msg) {
        this.clearLine(this.stream);
        this.stream.write(msg);
    }
});
spinner.setSpinnerString('|/-\\');



const log = console.log;

const exitProcess = () => {
    log(chalk.yellow('> [info]: ') + chalk.yellow('exit'));
    process.exit(0);
}

export const setupServer = async () => {
    try {
        let user = await User.findOne({ where: { id: 'user' } });
        if (user == null) {
            log(chalk.green('> [info]: ') + chalk.bold.blue('welcome sir, please provide us some details'));
            let name = readlineSync.question('> Your Name: ');
            let email = readlineSync.questionEMail('> Your Email: ');
            let password = readlineSync.questionNewPassword('> Your Password: ', { hideEchoBack: true, cancel: true, min: 6, max: 12, });
            log(chalk.bold.greenBright('> Please wait while we are setting up scpanle for you: '));
            spinner.start();
            password = await hash(password, await genSalt(8));
            const createdUser = User.create({
                id: 'user',
                name: name,
                host_user: userInfo().username,
                email: email,
                password: password,
            })
            await createdUser.save();
            spinner.stop(true);
            log(chalk.green('> [OK] :') + chalk.gray('user with name ') + chalk.bold.green(createdUser?.name) + chalk.gray(' and email ') + chalk.bold.green(createdUser?.email) + chalk.gray(' is created.'));
            log(chalk.yellow('> now you can access your server using scpanel web/mobile/desktop from anywere and anytime'));
            log(chalk.bold.gray('> Click here to login: ') + chalk.bold.green('https://scpanel.myportfolio.club'));
            logUser(createdUser);
        } else {
            logUser(user);
            var ans: string = readlineSync.question('> Setup for user ' + chalk.bold.greenBright(user.name) + ' with email ' + chalk.bold.greenBright(user.email) + ' is already found. Want to reset it ? (Y/N) : ');
            if (ans.toLowerCase() == 'y' || ans.toLowerCase() == 'yes') {
                log(chalk.bold.green('> [process]: ') + chalk.grey('checking server status'));
                spinner.start();
                let server = await Server.findOne({ where: { user: user } })
                if (!server) {
                    log(chalk.red('> [OK]: ') + chalk.bold.blue('server configuration not found'));
                    log(chalk.green('> [info]: ') + chalk.bold.greenBright('you have to start server after that you can reset your setup.'));
                    log(chalk.green('> [help]: ') + chalk.bold.blue('run ') + chalk.bold.grey('scpanel start') + chalk.bold.blue(' for start or init server'));
                } else {
                    log(chalk.green('> [status]: ') + chalk.blue('server configuration find with this user'));
                    log(chalk.green('> [process]: ') + chalk.grey('please wait while we are deleting server configuration'));
                    if (server.status == true) {
                        pm2.delete('my-server', (err) => {
                            if (err) { log(chalk.red('> [error]: error from pm2')); log(chalk.red(err)); }
                            else {
                                log(chalk.blue('> [stop]: ') + chalk.yellow('shutting down server'));
                                pm2.disconnect();
                            }
                        });

                    } else {
                        log(chalk.green('> [OK]: ') + chalk.grey('server is not running'));

                    }
                    await Server.delete({});
                }
                // await prisma.info.delete({ where: { email: user. } });
                log(chalk.green('> [sucess]: ') + chalk.blue('server removed'))
                spinner.stop(true);
                log(chalk.bold.redBright('> Please wait while we are removing your profile'));
                spinner.start();
                await User.delete({});
                spinner.stop(true);
                console.log(chalk.green('[OK]: ') + chalk.grey('user with name ') + chalk.bold.red(user.name) + chalk.gray(' and email ') + chalk.bold.red(user.email) + chalk.grey(' is removed.'));
                await setupServer();
            }
        }
        return user
    } catch (error) {
        spinner.stop();
        log(chalk.red(error));
        exitProcess();
    }
}

export const userDetails = async () => {
    log(chalk.green('> [process]: ') + chalk.bold.grey('wait while we are getting your account details'));
    spinner.start();
    try {
        let user = await User.findOne({
            where: {
                id: 'user'
            }
        });
        spinner.stop(true);

        if (!user) {
            log(chalk.yellow('> [info]: ') + chalk.green('Account info not found'));
            log(chalk.red('> [error]: ') + chalk.grey('user info not exist please setup your server ') + chalk.bold.greenBright('scpanel setup'));
        }
        else {
            log(chalk.green('> [OK]: ') + chalk.green('Logging account details with password'));
            logUser(user);
        }
    } catch (error) {
        spinner.stop();
        log(chalk.red(error));
        exitProcess();
    }
}

export const removeUser = async () => {
    try {
        let user = await User.findOne({ where: { id: 'user' } });
        if (!user) {
            log(chalk.redBright('> [error]: ') + chalk.red('user profile not found please setup your profile first'));
            log(chalk.blue('> [info]: ') + chalk.green('run ') + chalk.grey('scpanel setup ') + chalk.green('for setup your profile'));
        } else {
            log(chalk.yellow('> [warning]: ') + chalk.blue('this will remove your account info.'));
            var ans: string = readlineSync.question(chalk.bold.redBright('> are you sure? (y/n) : ') + chalk.gray('[default: n]: '));
            if (ans.toLowerCase() == 'y' || ans.toLowerCase() == 'yes') {

                log(chalk.bold.green('> [process]: ') + chalk.grey('checking server status'));
                spinner.start();
                let server = await Server.findOne({ where: { user: user } });
                if (!server) {
                    log(chalk.red('> [OK]: ') + chalk.bold.blue('server configuration not found'));
                    log(chalk.green('> [info]: ') + chalk.bold.greenBright('you have to start server after that you can reset your setup.'));
                    log(chalk.green('> [help]: ') + chalk.bold.blue('run ') + chalk.bold.grey('scpanel start') + chalk.bold.blue(' for start or init server'));
                } else {
                    log(chalk.green('> [status]: ') + chalk.blue('server configuration find with this user'));
                    log(chalk.green('> [process]: ') + chalk.grey('please wait while we are deleting server configuration'));
                    if (server.status == true) {
                        pm2.delete('my-server', (err) => {
                            if (err) { log(chalk.red('> [error]: error from pm2')); log(chalk.red(err)); }
                            else {
                                log(chalk.blue('> [stop]: ') + chalk.yellow('shutting down server'));
                                pm2.disconnect();
                            }
                        });

                    } else {
                        log(chalk.green('> [OK]: ') + chalk.grey('server is not running'));

                    }
                }
                await Server.delete({});
                log(chalk.green('> [sucess]: ') + chalk.blue('server removed'))
                spinner.stop(true);
                log(chalk.green('> [process]: ') + chalk.redBright('Please wait while we are removing your account info.'));
                spinner.start();
                await User.delete({});
                spinner.stop(true);
                log(chalk.green('> [OK]: ') + chalk.green('Account info removed.'));
                log(chalk.yellow('> [info]: ') + chalk.gray('run command for setup ') + chalk.green('scpanel setup'))
            } else {
                log(chalk.green('> [OK]: ') + chalk.gray('exiting'));
            }
        }
    } catch (error: any) {
        log(chalk.red('> [error]: ') + chalk.bold.redBright('error with databse'));
        log(chalk.red(error.message));
        exitProcess();
    }

}

export const changepsswd = async () => {
    log(chalk.green('> [process]: ') + chalk.bold.grey('wait while we are getting your account details'));
    spinner.start();
    let user = await User.findOne({ where: { id: 'user' } });
    spinner.stop(true);

    if (!user) {
        log(chalk.yellow('> [info]: ') + chalk.green('Account info not found'));
        log(chalk.red('> [error]: ') + chalk.grey('user info not exist please setup your server ') + chalk.bold.greenBright('scpanel setup'));
    }
    else {
        try {
            log(chalk.green('> [OK]: ') + chalk.green('Logging account details with password'));
            logUser(user);
            var password: string = readlineSync.questionNewPassword(chalk.green('> New password: '), { hideEchoBack: true, cancel: true, min: 6, max: 12 });
            log(chalk.green('> [process]: ') + chalk.grey('please wait while we are updating your password '));
            spinner.start();
            password = await hash(password, await genSalt(8));
            user.password = password;
            await User.update({
                id: 'user'
            }, { password: password });
            spinner.stop(true);
            log(chalk.green('> [OK]: ') + chalk.green('password updated'));
            log(chalk.yellow('> logging account details with new password'));
            logUser(user);
        } catch (error) {
            log(chalk.red('[error]: ') + chalk.redBright(error));
            exitProcess();
        }
    }
}

export const startServer = async () => {
    log(chalk.green('> [process]: ') + chalk.blue('starting server'));
    spinner.start();
    try {
        let user = await User.findOne({ where: { id: 'user' } });
        if (!user) {
            spinner.stop(true);
            log(chalk.red('> [error]: ') + chalk.blue('please setup your server first by runnig') + chalk.greenBright(' scpanel setup'));
            spinner.stop(true);
        } else {
            pm2.start({ name: 'my-server', script: __dirname + '/src/server.js' }, async (err: any) => {
                if (err) {
                    spinner.stop(true);
                    pm2.disconnect();
                    log(chalk.red('> [error]: ') + chalk.grey('server deployment error.'));
                    log(chalk.red(err));
                } else {
                    spinner.stop(true);
                    pm2.disconnect();
                    log(chalk.greenBright('> [OK]: ') + chalk.green('server is up and running '));
                    log(chalk.yellow('> [info]: ') + chalk.grey('go to http://scpanel.bytecodes.club and access your server manager'));
                    log(chalk.bold.blue('> [info]: ') + chalk.green('run ') + chalk.bold.blue('scpanel status ') + chalk.green('for ip and port which used for login'));
                }
            });
        }
    } catch (error) {
        spinner.stop(true);
        log(chalk.red('> [error]: '), chalk.redBright(error));
        exitProcess();
    }
}

export const serverStatus = async () => {
    log(chalk.green('> [process]: ') + chalk.blue('please wait while we are getting server data'));
    spinner.start();
    try {
        let user = await User.findOne({ where: { id: 'user' } });
        if (!user) {
            spinner.stop(true);
            log(chalk.redBright('> [error]: ') + chalk.gray('please setup your server first by running ') + chalk.green('scpanel setup'));
        }
        else {
            log(chalk.green('> [running]: ') + chalk.gray('loading server data with user email: ') + chalk.green(user?.email));
            let server = await Server.findOne({ where: { user: user } });
            if (!server) {
                spinner.stop(true);
                log(chalk.redBright('> [error]: ') + chalk.red('please start server by running') + chalk.grey(' scpanel start '));
            }
            else {
                spinner.stop(true);
                log(server.status ? chalk.green('> [OK]: ') + chalk.gray('server is ') + chalk.bold.greenBright('running') : chalk.red('> [OK]: ') + chalk.grey('server is ') + chalk.bold.redBright('not running'));
                if (server.status) {
                    log(chalk.bold.blue('> [info]: ') + chalk.green('your ip: ') + chalk.grey(server?.ip) + chalk.green(' port ') + chalk.grey(server?.port) + chalk.green(' password ') + chalk.grey(user?.password));
                }
            }
        }

    } catch (error) {
        log(chalk.red('> [error]: ') + chalk.grey('error in getting data from database'));
        log(chalk.red(error));
        exitProcess();
    }
}

export const stopServer = async () => {
    log(chalk.green('> [process]: ') + chalk.blue('stopping server'));
    spinner.start();
    try {
        let user = await User.findOne({ where: { id: 'user' } });
        if (!user) {
            spinner.stop(true);
            log(chalk.redBright('> [error]: ') + chalk.gray('please setup your server first by running ') + chalk.green('scpanel setup'));
        } else {
            log(chalk.green('> [running]: ') + chalk.gray('loading server data with user email: ') + chalk.green(user?.email));
            let server = await Server.findOne({ where: { user: user } });
            if (!server) {
                pm2.delete('my-server', (err) => {
                    pm2.disconnect();
                })
                spinner.stop(true);
                log(chalk.redBright('> [error]: ') + chalk.red('please start server by running'));
            } else {
                pm2.delete('my-server', (err) => {
                    pm2.disconnect();
                })
                await Server.update({
                    user: user
                }, {
                    status: false
                });
                spinner.stop(true);
                log(chalk.green('> [OK]: ') + chalk.gray('server ') + chalk.bold.redBright('stopped'));
            }
        }
    } catch (error) {
        spinner.stop(true);
        log(chalk.redBright('> [error]: error in stopping server'));
        log(chalk.red(error));
        exitProcess();
    }
}

export const help = () => {
    log(chalk.green('> [info]: ') + chalk.blue('try this'));
    log(chalk.green('> [info]: ') + chalk.blue('commands') + chalk.grey(' \n> [scpanel setup ') + chalk.green('use for setup profile ]') + chalk.grey(' \n> [scpanel userdetails ') + chalk.green('use for get user profile details ]') + chalk.grey(' \n> [scpanel removeuser ') + chalk.green('use for remove user profile ]') + chalk.grey(' \n> [scpanle changepsswd ') + chalk.green('use for change login password for user ]') + chalk.grey(' \n> [scpanel start ') + chalk.green('use for start server ]') + chalk.grey(' \n> [scpanle stop ') + chalk.green('use for stop server ]') + chalk.grey(' \n> [scpanle status ') + chalk.green('use for check status of server is running or not ]') + chalk.grey(' \n> [scpanle mypubip ') + chalk.green('use for get your public ip ]') + chalk.grey(' \n> [scpanle help ') + chalk.green('use for get list of usefull commands ]'));
}

export const notfound = (args: string) => {
    log(chalk.redBright('> [error]: ') + chalk.blueBright('invalid argument ') + chalk.bold.grey(args));
    help();
}

export const getPubIp = async () => {
    log(chalk.green('> [process]: ') + chalk.blue('please wait while we are getting your public ip'));
    spinner.start();
    try {
        var res: AxiosResponse = await axios({ method: 'GET', url: 'https://api.ipify.org/' });
        spinner.stop(true);
        if (res.status == 200) {
            log(chalk.green('> [OK]: ') + chalk.blue('your public ip is : ') + chalk.grey(`[${res.data}]`));
        }
    } catch (error: any) {
        spinner.stop(true);
        log(chalk.redBright('> [error]: ') + chalk.red(error.message));
        exitProcess();
    }
}

export const main = async (args: string) => {
    await dbConnection();
    if (args == 'setup') {
        await setupServer();
    }

    else if (args == 'userinfo') {
        await userDetails();
    }

    else if (args == 'removeuser') {
        await removeUser();
    }

    else if (args == 'changepsswd') {
        await changepsswd();
    }

    else if (args == 'start') {
        await startServer();
    }

    else if (args == 'status') {
        await serverStatus();
    }

    else if (args == 'stop') {
        await stopServer();
    }

    else if (args == 'mypubip') {
        await getPubIp();
    }
    else if (args == 'help') {
        help();
    }
    else if (args.toLowerCase() == 'v' || args.toLowerCase() == 'version') {
        log(chalk.green('> [version]: ') + chalk.blue(version));
    }
    else {
        notfound(args);
    }
}

if (argv.length > 2) {
    main(argv[argv.length - 1]);
} else {
    log(chalk.red('[error]: ') + chalk.grey('Please enter valid arguments or check setup documentation'));
}




export const logUser = (user: any) => {
    if (!user) console.log('user not found');
    var table = new Table({
        chars: {
            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
            , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
            , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
            , 'right': '║', 'right-mid': '╢', 'middle': '│'
        },
        head: ["id", "name", "hostname", "email", "password"],
    });

    table.push([user.id, user.name, user.host_user, user.email, user.password])
    log(table.toString());
}
