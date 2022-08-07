import { Category } from '../schemas/meal.schema';
import { User } from '../../auth/schemas/user.schema';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsOptional, IsEmpty } from 'class-validator';


export class UpdateMealDto {

    @IsOptional()
    @IsString()
    readonly name:string

    @IsOptional()
    readonly description: string

    @IsOptional()
    @IsNumber()
    readonly price: number

    @IsOptional()
    @IsEnum(Category, { message: 'Please enter correct category for this meal'})
    readonly category: Category

    @IsOptional()
    @IsString()
    readonly restaurant: string

    @IsEmpty({ message: 'You cannot provide a user ID.'})
    readonly user: User
}