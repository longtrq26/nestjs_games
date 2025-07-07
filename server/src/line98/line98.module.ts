import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Line98Controller } from './line98.controller';
import { Line98Service } from './line98.service';

@Module({
  providers: [Line98Service, PrismaService],
  controllers: [Line98Controller],
  exports: [Line98Service],
})
export class Line98Module {}
