import { Request, Response } from 'express';
import { IUser, IUserRepository } from '../types/user';
import SuggestionGenerationService from '../services/suggestionGenerationService';
import llm from '../openIA/chatOpenIA'
import bcrypt, { compare } from 'bcrypt';
import knex, { Knex } from 'knex';
import { sign } from 'jsonwebtoken';

export default class UserController {

    private readonly suggestionService: SuggestionGenerationService;
    
    constructor(private readonly userRepository: IUserRepository, suggestionService?: SuggestionGenerationService) {
        this.suggestionService = suggestionService || new SuggestionGenerationService(llm);
    }

    public async createUser(req: Request, res: Response) {
        const { name, email, password } = req.body;

        const user: IUser = {
            name,
            email,
            password: await bcrypt.hash(password, 10)
        }

        return res.status(201).json({
            data: await this.userRepository.createUser(user)
        });
    }

    public async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const credentials = { email, password };
        const token = await this.userRepository.login(credentials);

        return res.status(200).json({token});
    } 
    
    public async test(req: Request, res: Response) {
        return res.status(200).json({
            data: await this.userRepository.getUserByID(req.params.id)
        })
    }

    public async saveThemeSuggestions(req: Request, res: Response) {
        return res.status(201).json({
            data: await this.userRepository.insertUsersTheme(req.params.id, req.body.usersThemes)
        })
    }

    public async getUsersSuggestions(req: Request, res: Response) {
        const themesNames = await this.userRepository.getUsersThemes(req.params.id);
        
        const suggestions = await this.suggestionService.generate(themesNames);
        return res.status(200).json({
            data: suggestions 
        })
    }

    public async getThemes(req: Request, res: Response) {
        const themes = await this.userRepository.getThemes();
        return res.status(200).json({
            data: themes
        })
    }
}
