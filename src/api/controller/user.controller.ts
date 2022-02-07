import { Router } from 'express';

import { isAuthenticated } from '../middlewares/isAuthenticated';
import { checkRequiredfields, checkRequiredHeaders, checkRequiredQueries } from '../middlewares/middlewares';
import { basicInfo, getUser, loginUser, logoutUser, testHost, readDir, createFolder, deleteEntity, createFile, readFile, copyEntity, rename, move } from '../service/user.service';
export const userController: Router = Router();

userController.post('/test-host',
    checkRequiredfields(['ip', 'port', 'protocol']),
    testHost,
);

userController.post('/login',
    checkRequiredfields(['password']),
    loginUser,
);

userController.get('/profile',
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    getUser
)

userController.delete('/logout',
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    logoutUser,
)

userController.get('/basic-info',
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    basicInfo,
)

userController.get('/fs',
    checkRequiredQueries(['hidden']),
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    readDir,
)

userController.post('/fs/folder',
    checkRequiredQueries(['path', 'folderName']),
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    createFolder,
)

userController.delete('/fs',
    checkRequiredQueries(['path']),
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    deleteEntity,
)

userController.post('/fs/file',
    checkRequiredQueries(['path', 'fileName']),
    checkRequiredfields(['data']),
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    createFile,
)

userController.get('/fs/file',
    checkRequiredQueries(['path']),
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    readFile,
)

userController.post('/fs/copy',
    checkRequiredQueries(['source', 'destination']),
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    copyEntity,
)

userController.post('/fs/rename',
    checkRequiredQueries(['path', 'newName']),
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    rename,
)

userController.post('/fs/move',
    checkRequiredQueries(['source', 'destination']),
    checkRequiredHeaders(['authorization']),
    isAuthenticated,
    move,
)