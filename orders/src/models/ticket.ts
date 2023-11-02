import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from "./order";

interface TicketAttrs {
    id: string,
    title: string,
    price: number,
}

export interface TicketDoc extends mongoose.Document {
    title: string,
    price: number,
    version: number,
    isReserved(): Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string, version: number}): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            // change _id to id so that db like MySQL/postgres can also use it
            ret.id = ret._id
            delete ret._id;
        }
    }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
}

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        // assign `_id` manually so that we can keep the ticket id to be the same as the id in ticket service
        // Otherwise, order service will generate a new _id when we are building the ticket in listener
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
}
ticketSchema.methods.isReserved = async function() {
    // this === the ticket document that we just called 'isReserved' on
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    })
    return !!existingOrder;

}
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
