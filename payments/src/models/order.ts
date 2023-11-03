import { OrderStatus } from "@wtjtickets/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import mongoose from "mongoose";

// list of properties we need to provide when building an order
interface OrderAttrs{
    id: string,
    status: OrderStatus,
    version: number,
    price: number,
    userId: string

}

// list of properties an order has
interface OrderDoc extends mongoose.Document{
    // it already includes id, so we dont need to inlcude id here
    status: OrderStatus,
    version: number,
    price: number,
    userId: string
}

// list of properties the model has, including the custom methods
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    // not include version because it will be automatically maintained by update-if-current
    status: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            // change _id to id so that db like MySQL/postgres can also use it
            ret.id = ret._id
            delete ret._id;
        }
    }
})

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        userId: attrs.userId,
        status: attrs.status
    });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export{Order};