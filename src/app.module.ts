import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { UserModule } from './users/user.module';
import { Neo4jModule } from './neo4j/neo4j.module';

const MONGODBURI = 'urilab'

@Module({
  imports: [
    MongooseModule.forRoot(MONGODBURI, {
      
    }),
    ProductsModule,
    UserModule,
    Neo4jModule,
   
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
