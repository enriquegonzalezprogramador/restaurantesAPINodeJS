import {  Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors, Req, ForbiddenException } from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Restaurant } from '../schemas/restaurant.schema';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { get } from 'http';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get()
  
  async getAllRestaurants(@Query() query: ExpressQuery, @Req() req): Promise<Restaurant[]> {
    return this.restaurantsService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('admin')
  async createRestaurant(@Body() restaurant: CreateRestaurantDto, @CurrentUser() user: User): Promise<Restaurant> {
    return this.restaurantsService.create(restaurant, user);
  }

  @Get(':id')
  async getRestaurant(@Param('id') id:string): Promise<Restaurant> {
      return this.restaurantsService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async updateRestaurant(@Param('id') id: string, @Body() restaurant: UpdateRestaurantDto, @CurrentUser() user: User): Promise<Restaurant> {


   const res =  await this.restaurantsService.findById(id);

   if(res.user.toString() !== user.id.toString()) {
     throw new ForbiddenException('You can not update this restaurant.');
   }

    return this.restaurantsService.updateById(id, restaurant);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteRestaurant(@Param('id') id:string, @CurrentUser() user: User): Promise <{ deleted: Boolean} > {

    const restaurant = await this.restaurantsService.findById(id);


    if(restaurant.user.toString() !== user.id.toString()) {
      throw new ForbiddenException('You can not delete this restaurant.');
    }

    const isDeleted = await this.restaurantsService.deleteImages(restaurant.images)

    if(isDeleted) {
        this.restaurantsService.deleteById(id);

        return {
            deleted: true
        };
    } else {
        return {
            deleted: false
        }
    }




  }

  @Put('upload/:id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@Param('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>) {

    await this.restaurantsService.findById(id);

    const res = await this.restaurantsService.uploadImages(id, files);

    return res;

  }


}
