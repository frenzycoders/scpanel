import express, { Response, Request, NextFunction } from 'express'
import { createServer } from 'http';
import fs, { appendFile, appendFileSync } from 'fs'
import { gracefulify } from 'graceful-fs';
import chalk from 'chalk';
import { userController } from './api/controller/user.controller';
import { config } from 'dotenv'
import axios, { AxiosResponse } from 'axios'
import { dbConnection } from './connection';
import { User } from './models/user';
import { Server } from './models/server';
import { homedir } from 'os';
import cors from 'cors'

let pubIp: any = null;

declare global {
    namespace Express {
        interface Request {
            user: any,
            machine: any
            file: any,
            token: string,
            server: any
        }
    }
}

gracefulify(fs);
dbConnection();
console.log(chalk.green('> [process]: ') + chalk.bold.grey('loading data from .env'));
config();
console.log(chalk.green('> [OK]: ') + chalk.bold.gray('data loaded'));


const app = express();


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
const myserver = createServer(app);
const PORT = process.env.SERVER_PORT || 8080;

app.use(async (req: Request, res: Response, next: NextFunction) => {
    let start = Date.now();
    req.on('end', async () => {
        let end = Date.now();
        let val = { "method": req.method, "time": end - start + 'ms', "path": req.path, "date": Date.now().toString() };
        console.log(chalk.green('> [logs]: ') + chalk.gray(' method: ') + chalk.greenBright(val.method) + chalk.grey(' path: ') + chalk.greenBright(val.path) + chalk.grey(' time: ') + chalk.greenBright(val.time),);
        if (fs.existsSync(__dirname + '/server.logs')) {
            appendFileSync(__dirname + '/server.logs', JSON.stringify(val) + '\n');
        } else {
            fs.writeFileSync(__dirname + '/server.logs', JSON.stringify(val) + '\n');
        }
    });
    next();
});
app.use('/user', userController);

console.log(chalk.green('> [process]: ') + chalk.bold.gray('starting server'));

myserver.listen({ port: PORT }, async () => {
    const details: any = myserver.address();
    console.log(chalk.bold.green('> [OK]: ') + chalk.yellow('server started at ') + chalk.bold.gray(details.address == '::' ? 'http://127.0.0.1:' + details.port : details.address + ':' + details.port));
    await changeServerStatue(details);
    console.log(chalk.bold.gray('> family: ') + chalk.green(details.family));
    console.log(chalk.green('> [public ip]: ') + chalk.blue(pubIp));
});

const changeServerStatue = async (details: any) => {
    try {
        var res: AxiosResponse = await axios({ method: 'GET', url: 'https://api.ipify.org/' });
        if (res.status == 200) {
            pubIp = res.data;
        }
    } catch (error) {
        console.log(error);
    }
    let user: any = await User.findOne({ where: { id: 'user' } });
    if (!user) {
        console.log(chalk.redBright('> [error]: ') + chalk.red('please setup your profile first'));
        console.log(chalk.green('> [info]: ') + chalk.blue('run ') + chalk.grey('scpanel setup ') + chalk.blue('for setup your profile'));
        process.exit(0);
    }
    let server = await Server.findOne({ where: { user: user } });
    if (!server) {
        await Server.create({
            error: false,
            ip: pubIp,
            port: details.port.toString(),
            status: true,
            email: user.email,
            user: user,
            homeDir: homedir()
        }).save()

    } else {
        await Server.update({ user: user }, {
            error: false,
            ip: pubIp,
            port: details.port.toString(),
            status: true,
            email: user.email,
            homeDir: homedir()
        });
    }
}