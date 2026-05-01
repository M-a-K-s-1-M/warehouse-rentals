import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import { WarehousesController } from "./warehouses.controller";
import { WarehousesService } from "./warehouses.service";

@Module({
    imports: [PrismaModule, JwtModule.register({})],
    controllers: [WarehousesController],
    providers: [WarehousesService],
})
export class WarehousesModule { }
