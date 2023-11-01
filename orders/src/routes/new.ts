import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@wtjtickets/common';
import {body} from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 15;
router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('ticketid must be provided')
], validateRequest, async (req: Request, res: Response) => {
    const {ticketId} = req.body;
    // find the ticket
    const ticket = await Ticket.findById(ticketId);
    if(!ticket) {
        throw new NotFoundError
    }
    // make sure that this ticket is not already reserved 
    // run query to look at all orders, find an order where the ticket status is not cancelled
    const isReserved = await ticket.isReserved();
    if (isReserved) {
        throw new BadRequestError('Ticket is alreay reserved');
    } 

    // calculate expiration time
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    // build order and save
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket
    })
    await order.save();

    // publish an event saying the order is created 
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    })

    res.status(201).send(order);
})
export { router as newOrderRouter }