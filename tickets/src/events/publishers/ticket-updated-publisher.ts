import { Publisher, Subjects, TicketUpdatedEvent } from "@wtjtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}

