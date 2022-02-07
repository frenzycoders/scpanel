import { NextFunction, Request, Response, } from "express";
import { Token } from "./../../models/token";
import { verify } from 'jsonwebtoken'
import { secret } from "./../service/user.service";
import { User } from "./../../models/user";
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let headers: any = req.headers;
        let token: string = headers.authorization;
        if (token.split(' ').includes('Bearer')) {
            let decode: any = verify(token.split(' ')[1], secret);

            let t = await Token.findOne({ where: { token: token.split(' ')[1] } });
            if (!t) return res.status(404).send('invalid token please login again');

            let user = await User.findOne({ where: { email: decode.email } });
            
            if (!user) return res.status(404).send('token expired please login again');
            else {
                req.token = token.split(' ')[1];
                req.user = user;
                next();
            }
        } else return res.status(400).send('bad authorization token Bearer not found in token');
    } catch (error) {
        res.status(500).send(error.message)
    }
}