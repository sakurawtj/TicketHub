// refactor the index.ts to app.ts because app in index.ts is listening on port 3000
// there are other services that is also listening on port 3000 (e.g. ticket)
// so that we can create app.ts to create the app and export, which is not listening on any port
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentuserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@wtjtickets/common';


const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        // set secure to false when under the enviroment of testing
        secure: process.env.NODE_ENV !== 'test'
    })
);

app.use(currentuserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// app.all('*', async (req, res, next) => {
//     next(new NotFoundError());
// })
app.all('*', (req, res, next) => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app};
