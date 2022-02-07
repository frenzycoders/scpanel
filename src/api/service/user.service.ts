import { Request, Response } from 'express';
import { Server } from './../../models/server';
import { User } from './../../models/user';
import { Token } from './../../models/token';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken'
import diskSpace from 'check-disk-space';
import { arch, freemem, homedir, platform, type, totalmem, uptime, hostname, } from 'os';
import { mkdir, readdir, rmdir, stat, unlink } from 'fs/promises';
import { readFileSync, watchFile, } from 'graceful-fs';
import { writeFileSync, renameSync, mkdirSync, } from 'fs';
import { copySync, moveSync } from 'fs-extra';
export let access: string = 'someassess';
export let secret: string = 'this is secret of my server';

const genToken = async (user: any) => {
    try {

        let token = sign({ email: user.email, access }, secret, { expiresIn: 60 * 60 * 24 * 7 });
        let t = await Token.create({ token: token, user: user }).save();
        return t;
    } catch (error) {
        throw error;
    }
}



export const getUser = async (req: Request, res: Response) => {
    req.user.password = undefined;
    res.status(200).send({ user: req.user, token: req.token });
}



export const testHost = async (req: Request, res: Response) => {
    try {
        let { ip, port, protocol } = req.body;
        let user: any = await User.findOne({ where: { id: 'user' } });
        let server = await Server.findOne({ where: { user: user } });
        if (server) {
            server.ip = ip;
        }
        user.password = undefined;
        res.status(200).send({ user, server, protocol });
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        let { password } = req.body;
        let user: any = await User.findOne({ where: { id: 'user' } });

        let isValid: Boolean = await compare(password, user.password);

        if (!isValid) return res.status(500).send('wrong password please try again');
        let token: Object = await genToken(user);
        res.status(200).send({ user: token });
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const logoutUser = async (req: Request, res: Response) => {
    try {
        await Token.delete({ token: req.token });
        res.status(200).send('logged out');
    } catch (error) {
        res.status(500).send(error.message);
    }
}


export const basicInfo = async (req: Request, res: Response) => {
    try {
        let value = await diskSpace(process.platform == 'win32' ? 'C:/' : '/');
        let sysInfo = { arch: arch(), freeMemory: freemem(), homeDir: homedir(), platform: platform(), ostype: type(), totalMemory: totalmem(), uptime: uptime(), hostname: hostname(), totalStorage: value.size / (1024 * 1024 * 1024), freeStorage: value.free / (1024 * 1024 * 1024), diskPath: value.diskPath };
        res.status(200).send(sysInfo);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const readDir = async (req: Request, res: Response) => {
    try {
        let path = req.query.path || homedir();
        let { hidden } = req.query;

        let dirs: Object[] = [];

        let d = await readdir(path.toString(), { withFileTypes: true });
        if (d.length == 0) return res.status(200).send({ dirs, length: dirs.length });

        d.map((e) => {
            if (hidden == 'true')
                dirs.push({ name: e.name, isFolder: e.isDirectory(), path: path != '/' ? path + '/' + e.name : '/' + e.name });
            else
                if (e.name[0] != '.') dirs.push({ name: e.name, isFolder: e.isDirectory(), path: path != '/' ? path + '/' + e.name : '/' + e.name });
        })

        res.status(200).send({ dirs, length: dirs.length });
    } catch (error) {
        res.status(500).send(error.message);
    }
}


export const createFolder = async (req: Request, res: Response) => {
    try {
        let path = req.query.path?.toString() || ''
        let state = await stat(path);
        if (state.isFile()) {
            return res.status(500).send('path is file type please enter correct path');
        } else if (state.isDirectory()) {
            await mkdir(path == '/' ? '/' + req.query.folderName : path + '/' + req.query.folderName, { recursive: true });
            return res.status(200).send('folder create with path [' + path + '/' + req.query.folderName + ']');
        } else return res.status(500).send('path not found');
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const createFile = async (req: Request, res: Response) => {
    try {
        if (!req.query.path || !req.body.data || !req.query.fileName) return res.status(404).send('please add path and data to query and body');
        let path = req.query.path.toString();
        let state = await stat(path);
        if (state.isFile()) {
            return res.status(500).send('path is file type please enter correct path');
        } else if (state.isDirectory()) {
            path = path == '/' ? '/' + req.query.fileName?.toString() : path + '/' + req.query.fileName;
            writeFileSync(path, req.body.data);
            return res.status(200).send('file create with path [' + path + '/' + req.query.fileName + ']');
        } else return res.status(500).send('path not found');
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const deleteEntity = async (req: Request, res: Response) => {
    try {
        let { path } = req.query;
        if (!path) return res.status(404).send('please add file path to query');
        else {
            let state = await stat(path.toString());
            if (state.isDirectory()) {
                await rmdir(path.toString(), { recursive: true, maxRetries: 3 });
                return res.status(200).send('directory with path [' + path + '] was deleted');
            } else if (state.isFile()) {
                await unlink(path.toString());
                return res.status(200).send('file with path [' + path + '] was deleted');
            } else return res.status(500).send('something went wrong this path is not file or folder type');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const readFile = async (req: Request, res: Response) => {
    try {
        let { path } = req.query;
        if (!path) return res.status(404).send('path not found');
        else {
            let state = await stat(path.toString());
            if (state.isFile()) {
                let data = readFileSync(path.toString(), { encoding: 'utf-8' });
                return res.status(200).send({ path: path, data: data });
            } else res.status(500).send('this path is not a file');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const copyEntity = async (req: Request, res: Response) => {
    try {
        let { source, destination } = req.query;
        if (!source || !destination) return res.status(404).send('Please add source and destination');
        await stat(source.toString());
        let pbState = await stat(destination.toString());

        if (!pbState.isDirectory()) return res.status(404).send("destenation expected as directory but got file");

        let fileName = source.toString().split('/')[source.toString().split('/').length - 1];
        copySync(source.toString(), destination.toString() + '/' + fileName);
        res.status(200).send('copied ' + source + ' to ' + destination);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const rename = async (req: Request, res: Response) => {
    try {
        let { path, newName } = req.query;

        if (!path || !newName) return res.status(404).send('Please enter query details');
        let oldPath = path?.toString();

        let state = await stat(oldPath);

        let pathArr = oldPath.split('/');
        pathArr[pathArr.length - 1] = newName.toString();

        let newPath = pathArr.join('/');
        renameSync(oldPath, newPath);
        res.status(200).send('path renamed');
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const move = async (req: Request, res: Response) => {
    try {
        let { source, destination } = req.query;
        if (!source || !destination) return res.status(404).send('source and destination not found in query');

        let sourceState = await stat(source.toString());
        let destState = await stat(destination.toString());

        if (!destState.isDirectory()) return res.status(404).send('distination is not folder');
        let fileName = source.toString().split('/')[source.toString().split('/').length - 1];
        moveSync(source.toString(), destination.toString() + '/' + fileName);

        res.status(200).send('copied ' + source + ' to ' + destination);

    } catch (error) {
        res.status(500).send(error.message);
    }
}