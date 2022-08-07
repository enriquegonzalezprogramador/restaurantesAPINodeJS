import { TestingModule, Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRoles } from './schemas/user.schema';
import { Model } from 'mongoose';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import APIFeatures from '../utils/apiFeatures.util';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockUser = {
    _id: '2342',
    email: "ghulam@gmail.com",
    password : "12345678",
    role: UserRoles.USER
  };

  const token = 'jwtToken';

const mockAuthService = {
    create: jest.fn(),
    findOne: jest.fn()
}


describe('AuthService', () => {

    let service: AuthService;
    let model: Model<User>

    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: '',
                    signOptions: { expiresIn: '1d' }
                })
            ],
            providers: [
                AuthService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockAuthService
                }
            ]
        }).compile();

        service = module.get<AuthService>(AuthService)
        model = module.get<Model<User>>(getModelToken(User.name))

    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    });

    describe('signUp', () => {

        const signUpDto = {
            name: 'Ghulam',
            email: 'ghulam@gmail.com',
            password: '12345678'
        }

        it('should register a new user', async () => {
            jest.spyOn(bcrypt, 'hash ').mockResolvedValueOnce('testHash');
            jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockUser))

            jest.spyOn(APIFeatures, 'assignJwtToken').mockRejectedValueOnce(token)

            const result = await service.signUp({
                name: 'Ghulam',
                email: 'ghulam@gmail.com',
                password: '12345'
            });

            expect(bcrypt.hash).toHaveBeenCalled();
            expect(result.token).toEqual(token);
        });

        it('should throw duplicate email entered', async () => {

            jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.reject({code: 11000}))



        const token =  await  expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);

           return { token };
        });
    });

    describe('login', () => {

        const loginDto = {

            email: 'ghulam@gmail.com',
            password: '12345678'
        };

        it('should login user and return the token', async () => {
            jest.spyOn(model, 'findOne').mockImplementationOnce(() => ({
                select: jest.fn().mockRejectedValueOnce(mockUser)
            } as any))

            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

            jest.spyOn(APIFeatures, 'assignJwtToken').mockResolvedValueOnce(token);

            const result = await service.login(loginDto);

            expect(result.token).toEqual(token);
            
        });

        it('should throw invalid email error', async () => {
            jest.spyOn(model, 'findOne').mockImplementationOnce(() => ({
                select: jest.fn().mockResolvedValueOnce(null)
            } as any))

            expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });


        it('should throw invalid password error', async () => {
            jest.spyOn(model, 'findOne').mockImplementationOnce(() => ({
                select: jest.fn().mockRejectedValueOnce(mockUser)
            } as any))

            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

            expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            
        });
    })


})