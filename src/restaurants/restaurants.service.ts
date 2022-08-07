import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Restaurant } from '../schemas/restaurant.schema';
import { Query  } from 'express-serve-static-core';
import APIFeatures from '../utils/apiFeatures.util';
import { ignoreElements } from 'rxjs';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class RestaurantsService {

    constructor(
        @InjectModel(Restaurant.name)
        private restaurantModel: mongoose.Model<Restaurant>
    ) {}

    //Get all Restaurants => GET /restaurants
    async findAll(query: Query): Promise<Restaurant[]> {

        const resPerPage = 2;
        const currentPage = Number(query.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        const keyword = query.keyword ? {
            name: {
                $regex: query.keyword,
                $options: 'i'
            }
        }: {}

        const restaurants = await this.restaurantModel.find({... keyword})
        .limit(resPerPage)
        .skip(skip);

        return restaurants;
    }

    //Create new Restaurant => POST /restaurants

    async create(restaurant: Restaurant, user: User): Promise<Restaurant>  {

        const location = await APIFeatures.getRestaurantLocation(restaurant.address);
        
        const data = Object.assign(restaurant, { user: user._id, location });
            
        const res = await this.restaurantModel.create(data);

        return res;
    }

    //Get a restaurant by ID => GET /restaurant/:id

    async findById(id: string) : Promise<Restaurant> {

        const isValidId = mongoose.isValidObjectId(id);

        if(!isValidId) {
            throw new BadRequestException('Wrong mongoose ID Error. Please correct ID')
        }

        const restaurant = await this.findById(id);

        if(!restaurant) {
            throw new NotFoundException('Restaurant not found.');
        }

        return restaurant;
    }

    // Update a restaurant by ID => PUT /restaurants/:id

    async updateById(id:string, restaurant: Restaurant) : Promise<Restaurant> {
        return await this.restaurantModel.findByIdAndUpdate(id, restaurant, {
            new: true,
            runValidators: true
        });
    }

        //Delete a restaurant by ID => DElETE /restaurants/:id
    async deleteById(id: string) : Promise<Restaurant> {
        return await this.restaurantModel.findByIdAndDelete(id);
    }

    // Upload Images => PUT / restaurants/upload/:id
    async uploadImages(id, files) {
        const images = await APIFeatures.upload(files);

        const restaurant = await this.restaurantModel.findByIdAndUpdate(id, {
            images: images as Object[]
        }, {
            new: true,
            runValidators: true,
        })

        return restaurant;
    }

    async deleteImages(images) {
        if(images.length === 0) return true;
        const res = await APIFeatures.deleteImages(images);
        return res;
    }

}
