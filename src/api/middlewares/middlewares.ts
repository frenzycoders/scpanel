import { NextFunction, Request, Response } from "express"

export const checkRequiredfields = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let errorFields: string[] = [];
        const requiredFields = Object.keys(req.body);

        fields.forEach((e: string) => {
            if (!requiredFields.includes(e)) {
                errorFields.push(e);
            }
        });

        if (errorFields.length > 0) {
            return res.status(400).send(errorFields.join(',') + ' fields required in body')
        }

        next();
    }
}

export const checkRequiredHeaders = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errorFields: string[] = [];
        const requiredFields = Object.keys(req.headers);

        fields.forEach((e: string) => {
            if (!requiredFields.includes(e)) {
                errorFields.push(e);
            }
        });

        if (errorFields.length > 0) return res.status(400).send(errorFields.join(',') + ' fields required in headers')

        next();
    }
}

export const checkRequiredQueries = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errorFields: string[] = [];
        const requiredFields = Object.keys(req.query);

        fields.forEach((e: string) => {
            if (!requiredFields.includes(e)) {
                errorFields.push(e);
            }
        })

        if (errorFields.length > 0) return res.status(400).send(errorFields.join(',') + ' fields required in query');

        next();
    }
}