import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantSchema } from 'src/schemas/restaurant.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
      AuthModule,
      MongooseModule.forFeature([
        { name: 'Restaurant', schema: RestaurantSchema}
    ])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [MongooseModule]
})
export class RestaurantsModule {}
