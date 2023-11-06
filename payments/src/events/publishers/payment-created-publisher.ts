import { Subjects, Publisher, PaymentCreatedEvent } from "@wtjtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject= Subjects.PaymentCreated;
}