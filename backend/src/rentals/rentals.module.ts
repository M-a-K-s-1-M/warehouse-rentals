import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import { RentalsController } from "./rentals.controller";
import { RentalsService } from "./rentals.service";

@Module({
    imports: [PrismaModule, JwtModule.register({})],
    controllers: [RentalsController],
    providers: [RentalsService],
})
export class RentalsModule { }
