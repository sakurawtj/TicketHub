import request from 'supertest'
import {app} from '../../app'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('returns error if ticket not exist', async() => {
    const ticketId = new mongoose.Types.ObjectId();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(404)
})
it('returns error if ticket is reserved', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    })
    await ticket.save();
    const order = Order.build({
        ticket,
        userId: 'KJHGF',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(400)


})
it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });
    await ticket.save();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);

})

it.todo('emits an order created event')