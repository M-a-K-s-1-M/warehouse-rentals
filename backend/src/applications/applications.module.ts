import { Module } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { ApplicationsController } from "./applications.controller";
import { AuthModule } from "../auth/auth.module";
import { ApplicationsGateway } from "./applications.gateway";

@Module({
    imports: [AuthModule],
    providers: [ApplicationsService, ApplicationsGateway],
    controllers: [ApplicationsController],
    exports: [ApplicationsService],
})
export class ApplicationsModule { }
