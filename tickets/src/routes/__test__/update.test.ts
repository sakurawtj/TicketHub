import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns 404 if id not exists', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: "asdf",
            price: 20
        })
        .expect(404);
})
it('returns 401 if user not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: "asdf",
            price: 20
        })
        .expect(401);
})
it('returns 401 if user does not own ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title:"asdf",
            price:20
        })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: "lkjhg",
            price: 25
        })
        .expect(401)
})
it('returns 400 if user provide invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "asdf",
            price: 20
        })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "lkjhg",
            price: -25
        })
        .expect(400)

})
it('updates the ticket successfully', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "asdf",
            price: 20
        })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "lkjhg",
            price: 25
        })
        .expect(200)
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();
    expect(ticketResponse.body.title).toEqual("lkjhg")
    expect(ticketResponse.body.price).toEqual(25)
})