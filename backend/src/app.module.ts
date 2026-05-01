import { Module } from "@nestjs/common";
import { ApplicationsModule } from "./applications/applications.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [PrismaModule, ApplicationsModule, UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
