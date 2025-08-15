/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByUsername: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash password and call usersService.create', async () => {
      const username = 'testuser';
      const password = '123456';
      (usersService.create as jest.Mock).mockResolvedValue({ id: 1, username });

      const result = await service.register(username, password);

      expect(usersService.create).toHaveBeenCalled();
      const calledArg = (usersService.create as jest.Mock).mock.calls[0][0];
      expect(calledArg.username).toBe(username);
      expect(await bcrypt.compare(password, calledArg.password)).toBe(true);
      expect(result).toEqual({ id: 1, username });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValue(null);

      await expect(service.login('user', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = {
        id: 1,
        username: 'user',
        password: await bcrypt.hash('wrong', 10),
      };
      (usersService.findByUsername as jest.Mock).mockResolvedValue(user);

      await expect(service.login('user', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return access token and user without password on success', async () => {
      const password = '123456';
      const hashed = await bcrypt.hash(password, 10);
      const user = { id: 1, username: 'user', password: hashed };
      (usersService.findByUsername as jest.Mock).mockResolvedValue(user);

      const result = await service.login('user', password);

      expect(result.access_token).toBe('mocked-token');
      expect(result.user.password).toBeUndefined();
      expect(result.user.id).toBe(user.id);
      expect(result.user.username).toBe(user.username);
    });
  });
});
