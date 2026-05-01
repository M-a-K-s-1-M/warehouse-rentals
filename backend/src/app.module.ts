import { Module } from "@nestjs/common";
import { ApplicationsModule } from "./applications/applications.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { WarehousesModule } from "./warehouses/warehouses.module";
import { RentalsModule } from "./rentals/rentals.module";

@Module({
  imports: [
    PrismaModule,
    ApplicationsModule,
    UsersModule,
    AuthModule,
    WarehousesModule,
    RentalsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
