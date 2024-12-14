import {User} from "../entity/User";
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {Email} from "../class/emailClass";
import {AppDataSource} from "../data-source";

export class AuthService {

    async register(email: Email, password: string, firstName: string, lastName: string): Promise<string> {
        const userRepository = AppDataSource.getRepository(User);
        const existingUser = await userRepository.findOneBy({email});

        if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User();
        user.email = email;
        user.password = passwordHash;
        user.firstName = firstName;
        user.lastName = lastName;

        await userRepository.save(user);

        return jwt.sign({userId: user.id}, 'fed2010', { expiresIn: '7d' });
    }

    async login(email: Email, password: string): Promise<string> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({email});

        if (!user) {
            throw new Error('Неверный email или пароль');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new Error('Неверный email или пароль');
        }

        return jwt.sign({userId: user.id}, 'fed2010', {expiresIn: '7d'})
    }
}

