import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from '../schemas/restaurant.schema';
import { Model } from 'mongoose';
import { UserRoles } from '../auth/schemas/user.schema';
import APIFeatures from '../utils/apiFeatures.util';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

const mockRestaurant = {
  _id: 'sdads',
  user: 'asd',
  menu: [],
  location: {
    type: 'Point',
    coordinates: [],
    formattedAddress: '',
    city: '',
    state: '',
    zipcode: '',
    country: ''
  },
  images: []
}

const mockRestaurantService = {

  find: jest.fn(),
  create: jest.fn(),
  findByid: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}

const mockUser = {
  _id: '2342',
  email: "ghulam@gmail.com",
  password : "12345678",
  role: UserRoles.USER
}

describe('RestaurantService', () => {

  let service: RestaurantsService;
  let model: Model<Restaurant>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getModelToken(Restaurant.name),
          useValue: mockRestaurantService
        }
      ]
    }).compile();

      service = module.get<RestaurantsService>(RestaurantsService)
      model = module.get<Model<Restaurant>>(getModelToken(Restaurant.name))
  }) 

  it('should be defined', () => {
      expect(service).toBeDefined()
  });

  describe('findAll',  ()=> {
    it('should get all restaurants', async () => {
        jest.spyOn(model, 'find').mockImplementationOnce(() => ({
          limit: () => ({
            skip: jest.fn().mockResolvedValue([mockRestaurant]),
          }),
        } as any));

        const restaurants = await service.findAll({keyword: 'restaurant'})
        expect(restaurants).toEqual([mockRestaurant]);

    });
  });


  describe('create', () => {

    const newRestaurant = {
      
      name: 'asd',
      email: 'asda@asd.com',
      category: 'Fast food',
      address: 'asd' 
    
    };

    it('Should create a new restaurant', async () => {

      jest.spyOn(APIFeatures, 'getRestaurantLocation').mockImplementation(() => Promise.resolve(mockRestaurant.location))

      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockRestaurant))

      const result = await service.create(
        newRestaurant as any,
         mockUser as any
         );

         expect(result).toEqual(mockRestaurant);
    })

  });

  describe('findById', () => {
    it('should get restaurant by Id', async () => {
      jest.spyOn(model, 'findById').mockRejectedValueOnce(mockRestaurant as any) 

      const result = await service.findById(mockRestaurant._id)

      expect(result).toEqual(mockRestaurant);
    });


    it('should throw wrong moongose id error', async () => {

       await expect(service.findById('wronid')).rejects.toThrow(
         BadRequestException
         );
    });

    it('should throw restaurant not found error', async () => {

      const mockError = new NotFoundException('Restaurant not found.')
      jest.spyOn(model, 'findById').mockRejectedValue(mockError);

      await expect(service.findById(mockRestaurant._id)).rejects.toThrow(
        NotFoundException,
        );

    });
  });

  describe('updateById', () => {
    it('should update the restaurant', async () => {

      const restaurant = { ...mockRestaurant, name: 'Updated name' };

      const updateRestaurant = { name: 'Updated name'};

      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(restaurant as any)

      const updatedRestaurant = await service.updateById(restaurant._id, updateRestaurant as any)

      expect(updateRestaurant.name).toEqual(updateRestaurant.name);

    });
  });

  describe('deleteById', () => {
    it('should delete the restaurant', async () => {

      const deleteMessage = { deleted: true }

      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValueOnce(deleteMessage as any)

      const result = await service.deleteById(mockRestaurant._id);

      expect(result).toEqual(mockRestaurant);
    });
  });


  describe('uplaodImages', () => {
      it('should upload restaurant images on S3 Bucket', async () => {

          const mockImages = [
            {
              "ETag": "",
              "Location": "",
              "key": "",
              "Bucket": ""           
             }
          ]

          const updateRestaurant = { ...mockRestaurant, images: mockImages }

          jest.spyOn(APIFeatures, 'upload').mockResolvedValueOnce(mockImages)

          jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(updateRestaurant as any)

          const files = [
            {
              fieldname: 'files',
              originalname: 'image1.jpeg',
              encoding: '7bit',
              mimetype: 'image/jpeg',
              buffer: '',
              size: 19128
            }
          ]

          const result = await service.uploadImages(mockRestaurant._id, files);
          expect(result).toEqual(updateRestaurant);
      });
  });

      describe('deleteImages', () => {
        it('should delete restaurant images from S3 Bucket', async () => {

          const mockImages = [
            {
              "ETag": "",
              "Location": "",
              "key": "",
              "Bucket": ""           
             }
          ]

          jest.spyOn(APIFeatures, 'deleteImages').mockResolvedValueOnce(true);

          const result = await service.deleteImages(mockImages);

          expect(result).toBe(true);



        })
      })

});