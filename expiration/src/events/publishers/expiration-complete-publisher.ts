import { Subjects, Publisher, ExpirationCompleteEvent } from "@wtjtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}