import { Category } from '../schemas/meal.schema';
import { User } from '../../auth/schemas/user.schema';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';


export class CreateMealDto {

    @IsNotEmpty()
    @IsString()
    readonly name:string

    @IsNotEmpty()
    readonly description: string

    @IsNotEmpty()
    @IsNumber()
    readonly price: number

    @IsNotEmpty()
    @IsEnum(Category, { message: 'Please enter correct category for this meal'})
    readonly category: Category

    @IsNotEmpty()
    @IsString()
    readonly restaurant: string

    @IsNotEmpty({ message: 'You cannot provide a user ID.'})
    readonly user: User
}