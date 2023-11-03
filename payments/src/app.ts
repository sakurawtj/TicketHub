import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@wtjtickets/common';
import { createChargeRouter } from './routes/new';

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
// if the user is authenticated, it will have valid currentUser property
app.use(currentUser);
app.use(createChargeRouter);


// app.all('*', async (req, res, next) => {
//     next(new NotFoundError());
// })
app.all('*', (req, res, next) => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app};
