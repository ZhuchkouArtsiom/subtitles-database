import { Module } from '@nestjs/common';
import { postgresProviders } from './postgres.providers';

@Module({
  providers: [...postgresProviders],
})
export class PostgresModule {}
