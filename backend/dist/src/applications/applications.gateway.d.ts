import type { Server } from "socket.io";
export type ApplicationEvent = {
    type: "created" | "updated" | "status" | "openStatus" | "assigned" | "photo" | "description" | "comment";
    applicationId: string;
};
export declare class ApplicationsGateway {
    server: Server;
    emitApplicationEvent(event: ApplicationEvent): void;
}
