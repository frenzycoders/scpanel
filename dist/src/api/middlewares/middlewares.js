"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRequiredQueries = exports.checkRequiredHeaders = exports.checkRequiredfields = void 0;
const checkRequiredfields = (fields) => {
    return (req, res, next) => {
        let errorFields = [];
        const requiredFields = Object.keys(req.body);
        fields.forEach((e) => {
            if (!requiredFields.includes(e)) {
                errorFields.push(e);
            }
        });
        if (errorFields.length > 0) {
            return res.status(400).send(errorFields.join(',') + ' fields required in body');
        }
        next();
    };
};
exports.checkRequiredfields = checkRequiredfields;
const checkRequiredHeaders = (fields) => {
    return (req, res, next) => {
        const errorFields = [];
        const requiredFields = Object.keys(req.headers);
        fields.forEach((e) => {
            if (!requiredFields.includes(e)) {
                errorFields.push(e);
            }
        });
        if (errorFields.length > 0)
            return res.status(400).send(errorFields.join(',') + ' fields required in headers');
        next();
    };
};
exports.checkRequiredHeaders = checkRequiredHeaders;
const checkRequiredQueries = (fields) => {
    return (req, res, next) => {
        const errorFields = [];
        const requiredFields = Object.keys(req.query);
        fields.forEach((e) => {
            if (!requiredFields.includes(e)) {
                errorFields.push(e);
            }
        });
        if (errorFields.length > 0)
            return res.status(400).send(errorFields.join(',') + ' fields required in query');
        next();
    };
};
exports.checkRequiredQueries = checkRequiredQueries;
//# sourceMappingURL=middlewares.js.map