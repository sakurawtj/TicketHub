import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@wtjtickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose, { set } from "mongoose";
import { Ticket } from "../../../models/ticket";


const setup = async () => {
    // create an instance of listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20

    })
    await ticket.save();
    // create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 999,
        userId: "afgfds"
    }
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, data, ticket, msg };
}
it('finds, updates and saves a ticket', async () => {
    const {msg, data,  ticket, listener} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket?.title).toEqual(data.title);
    expect(updatedTicket?.price).toEqual(data.price);
    expect(updatedTicket?.version).toEqual(data.version);
})

it('acks the message', async () => {
    const{msg, data, ticket, listener} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack if version number is skipped', async () => {
    const {msg, data, listener, ticket} = await setup();
    data.version = 10;
    try {
        await listener.onMessage(data, msg);
    } catch (err) {

    }
    expect(msg.ack).not.toHaveBeenCalled();
})