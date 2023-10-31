import { Publisher, Subjects, TicketCreatedEvent } from "@wtjtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}

