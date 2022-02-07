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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const token_1 = require("./../../models/token");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_service_1 = require("./../service/user.service");
const user_1 = require("./../../models/user");
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let headers = req.headers;
        let token = headers.authorization;
        if (token.split(' ').includes('Bearer')) {
            let decode = (0, jsonwebtoken_1.verify)(token.split(' ')[1], user_service_1.secret);
            let t = yield token_1.Token.findOne({ where: { token: token.split(' ')[1] } });
            if (!t)
                return res.status(404).send('invalid token please login again');
            let user = yield user_1.User.findOne({ where: { email: decode.email } });
            if (!user)
                return res.status(404).send('token expired please login again');
            else {
                req.token = token.split(' ')[1];
                req.user = user;
                next();
            }
        }
        else
            return res.status(400).send('bad authorization token Bearer not found in token');
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=isAuthenticated.js.map