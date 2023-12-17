import { Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { Neo4jController } from './neo4j.controller';

@Module({
  imports: [],
  controllers: [Neo4jController],
  providers: [Neo4jService],
})
export class Neo4jModule {}
