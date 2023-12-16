import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerApiVersion } from 'mongodb';
import { ProductsModule } from './products/products.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://tenini:1234@nr-db-project.42lnxo9.mongodb.net/bdnr-documental', {
      //serverApi: ServerApiVersion.v1,
    }),
    ProductsModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}