import { Module } from '@nestjs/common';
import { AuthGuard } from '@shared/modules/auth/guards/auth/auth.guard';

@Module({
  providers: [AuthGuard],
})
export class AuthModule {}
