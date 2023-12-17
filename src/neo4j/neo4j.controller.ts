import { Controller, Post, Body,Get,Param } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Controller('neo4j')
export class Neo4jController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @Post('createUser')
  async createUser(@Body() body) {
    return this.neo4jService.createUser(body.userId, body.userName);
  }

  @Post('createProduct')
  async createProduct(@Body() body) {
    return this.neo4jService.createProduct(body.productId, body.productName, body.category);
  }

  @Post('recordClick')
  async recordClick(@Body() body) {
    return this.neo4jService.recordClick(body.userId, body.productId);
  }
  @Post('recommendProducts')
  async recommendProducts(@Body('userId') userId: string): Promise<any[]> {
    return this.neo4jService.recommendProducts(userId);
  }
 
}

