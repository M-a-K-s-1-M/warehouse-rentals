import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server } from "socket.io";

export type ApplicationEvent = {
    type: "created" | "updated" | "status" | "openStatus" | "assigned" | "photo" | "description" | "comment";
    applicationId: string;
};

@WebSocketGateway({
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
})
export class ApplicationsGateway {
    @WebSocketServer()
    server: Server;

    emitApplicationEvent(event: ApplicationEvent) {
        this.server.emit("applications:updated", event);
    }
}
