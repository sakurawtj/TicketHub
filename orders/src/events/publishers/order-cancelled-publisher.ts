import { Publisher, OrderCancelledEvent, Subjects } from "@wtjtickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}