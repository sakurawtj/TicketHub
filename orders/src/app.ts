import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@wtjtickets/common';
import { indexOrderRouter } from './routes';
import { deleteOrderRouter } from './routes/delete';
import { showOrderRouter } from './routes/show';
import { newOrderRouter } from './routes/new';

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

app.use(indexOrderRouter);
app.use(deleteOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);


// app.all('*', async (req, res, next) => {
//     next(new NotFoundError());
// })
app.all('*', (req, res, next) => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app};
