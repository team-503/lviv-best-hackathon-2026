import { Module } from '@nestjs/common';
import { CsrfController } from './csrf.controller';
import { CsrfService } from './csrf.service';

@Module({
  controllers: [CsrfController],
  providers: [CsrfService],
})
export class CsrfModule {}
