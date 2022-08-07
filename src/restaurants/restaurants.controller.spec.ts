import { TestingModule, Test } from '@nestjs/testing';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { PassportModule } from '@nestjs/passport';
import { UserRoles } from '../auth/schemas/user.schema';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { hasUncaughtExceptionCaptureCallback } from 'process';



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
};

const mockRestaurantService = {
  findAll: jest.fn().mockResolvedValueOnce([mockRestaurant]),
  create: jest.fn(),
  findById: jest.fn().mockResolvedValueOnce(mockRestaurant),
  updateById: jest.fn(),
  deleteImages: jest.fn().mockResolvedValueOnce(true),
  deleteById: jest.fn().mockResolvedValueOnce({ deleted: true }),
  uploadImages: jest.fn()
}



const mockUser = {
  _id: '2342',
  email: "ghulam@gmail.com",
  password : "12345678",
  role: UserRoles.USER
}


describe('RestaurantsController', () => {

  let controller: RestaurantsController;
  let service: RestaurantsService

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
        imports: [PassportModule.register({ defaultStrategy: 'jwt'})],
        controllers: [RestaurantsController],
        providers: [
          {
            provide: RestaurantsService,
            useValue: mockRestaurantService
          }
        ]
    }).compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    service = module.get<RestaurantsService>(RestaurantsService)
  });



  it('should be defined', () => {
    expect(controller).toBeDefined();
 });

 describe('getAllRestaurants', () => {
   it('should get all restaurants', async () => {

     const result = await controller.getAllRestaurants({ keyword: 'restaurant'}, {});

     expect(service.findAll).toHaveBeenCalled();
     expect(result).toEqual([mockRestaurant]);
   });



 });


 describe('createRestaurant', () => {
   it('should create a new restaurant', async () => {

    const newRestaurant = {
      
      name: 'asd',
      email: 'asda@asd.com',
      category: 'Fast food',
      address: 'asd' 
    
    };

    mockRestaurantService.create = jest.fn().mockResolvedValueOnce(mockRestaurant);

    const result = await controller.createRestaurant(newRestaurant as any, mockUser as any);

    expect(service.create).toHaveBeenCalled();
    expect(result).toEqual(mockRestaurant);




   });
 });

 describe('getRestaurantById', () => {
   it('should get restaurant by ID', async () => {
     const result = await controller.getRestaurant(mockRestaurant._id);

     expect(service.findById).toHaveBeenCalled();
     expect(result).toEqual(mockRestaurant);
   });
 });

 describe('updateRestaurant', () => {

  const restaurant = { ...mockRestaurant, name: 'Updated name' };

  const updateRestaurant = { name: 'Updated name'};

   it('should update restaurant by ID', async() => {


    mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(mockRestaurant);

    mockRestaurantService.updateById = jest.fn().mockResolvedValueOnce(restaurant);

    const result = await controller.updateRestaurant(
      restaurant._id,
       updateRestaurant as any,
        mockUser as any);
    
    expect(service.updateById).toHaveBeenCalled();
    expect(result).toEqual(restaurant)
    expect(result.name).toEqual(restaurant.name);

   });

   it('should throw forbidden error', async () => {

    mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(mockRestaurant);

    const user = {
      ...mockUser,
      _id: 'assfsf'
    }

    await expect(controller.updateRestaurant(
      restaurant._id,
       updateRestaurant as any,
        user as any
        )
        ).rejects.toThrow(ForbiddenException);
   });
 });

 describe('deleteRestaurant', () => {
   it('should delete restaurant by ID', async () => {

    mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(mockRestaurant);

      const result = await controller.deleteRestaurant(mockRestaurant._id, mockUser as any);

      expect(service.deleteById).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
   })

   it('should not  delete restaurant because images are not deleted', async () => {

    mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(mockRestaurant);
 
    mockRestaurantService.deleteImages = jest.fn().mockRejectedValueOnce(false)
 
      const result = await controller.deleteRestaurant(mockRestaurant._id, mockUser as any);
 
      expect(service.deleteById).toHaveBeenCalled();
      expect(result).toEqual({ deleted: false });
   });

   it('should throw forbidden error', async () => {

    mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(mockRestaurant);

    const user = {
      ...mockUser,
      _id: 'assfsf'
    }

    await expect(controller.deleteRestaurant( mockRestaurant._id,user as any)
        ).rejects.toThrow(ForbiddenException);
   });

 });

 describe('uploadFiles', () => {
   it('should upalod restaurant images', async () => {

    const mockImages = [
      {
        "ETag": "",
        "Location": "",
        "key": "",
        "Bucket": ""           
       }
    ]

    const updatedRestaurant = {...mockRestaurant, images: mockImages};

    const files = [
      {
        fieldname: 'files',
        originalname: 'image1.jpeg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: '',
        size: 19128
      }
    ];

    mockRestaurantService.uploadImages = jest.fn().mockResolvedValueOnce(updatedRestaurant);

    const result = await controller.uploadFiles(mockRestaurant._id, files as any) 

    expect(service.uploadImages).toHaveBeenCalled();
    expect(result).toEqual(updatedRestaurant);

   });
 });

});