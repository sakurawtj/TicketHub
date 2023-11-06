import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@wtjtickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payments';

//jest.mock('../../stripe')

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

it('returns a 201 with valid inputs', async() => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const price = Math.floor(Math.random() * 100000)
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        price,
        userId: userId
    })
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);
    const stripeCharges = await stripe.charges.list({limit: 50})
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100
    })
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');
    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    })
    expect(payment).not.toBeNull();

})