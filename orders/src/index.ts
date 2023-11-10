import mongoose from 'mongoose';
import {app} from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/Listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/Listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/Listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/Listeners/payment-created-listener';

const start = async () => {
    console.log("starting.....")
    if(!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be defined")
    }
    if(!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined")
    }
    if(!process.env.NATS_CLIENT_ID) {
        throw new Error("NATS_CLIENT_ID must be defined")
    }
    if (!process.env.NATS_URL) {
        throw new Error("NATS_URL must be defined")
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error("NATS_CLUSTER_ID must be defined")
    }
    
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client.on('close', () => {
            console.log("NATS connection closed");
            process.exit();
        })
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to mongodb");
    } catch (err) {
        console.log(err);
    }
    
}

app.listen(3000, () => {
    console.log('Listening on port 3000!')
})

start();