import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@wtjtickets/common';

it('returns 404 when purchasing an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'sdfa',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
})

it('returns 401 when orde does not belongs to user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'sdfa',
            orderId: order.id
        })
        .expect(401);
    
})

it('returns 400 when purchasing a cancelled order', async ()=> {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Cancelled,
        version: 0,
        price: 20,
        userId: userId
    })
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'sdfa',
            orderId: order.id
        })
        .expect(400);


})