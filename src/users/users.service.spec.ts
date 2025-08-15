/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './models/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockUser = {
    id: 1,
    username: 'test',
    password: 'hashed',
    deletedAt: null,
  };

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if username or password is missing', async () => {
      await expect(service.create({} as User)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if username already exists', async () => {
      mockRepo.findOne.mockResolvedValueOnce(mockUser);
      await expect(
        service.create({ username: 'test', password: '123' } as User),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a new user', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      mockRepo.save.mockResolvedValueOnce(mockUser);
      const result = await service.create({
        username: 'test',
        password: '123',
      } as User);
      expect(result).toEqual({ message: 'User created!' });
    });
  });

  describe('findAll', () => {
    it('should return users without passwords', async () => {
      mockRepo.find.mockResolvedValueOnce([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1, username: 'test', deletedAt: null }]);
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      mockRepo.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.findByUsername('test');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should throw if user not found', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return user without password', async () => {
      mockRepo.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1, username: 'test', deletedAt: null });
    });
  });

  describe('update', () => {
    it('should throw if user not found', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.update(1, {} as User)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should hash password and update user', async () => {
      const body = { password: '123' } as User;
      mockRepo.findOne.mockResolvedValueOnce(mockUser);
      mockRepo.save.mockResolvedValueOnce({
        ...mockUser,
        ...body,
        password: 'hashed',
      });
      const result = await service.update(1, body);
      expect(result.user).not.toHaveProperty('password');
      expect(result.message).toBe('Updated data');
    });
  });

  describe('softRemove', () => {
    it('should throw if user not found', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.softRemove(1)).rejects.toThrow(NotFoundException);
    });

    it('should set deletedAt and return user without password', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      mockRepo.findOne.mockResolvedValueOnce(mockUser);
      mockRepo.save.mockResolvedValueOnce(deletedUser);
      const result = await service.softRemove(1);
      expect(result.user.deletedAt).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
      expect(result.message).toBe('Deleted user');
    });
  });

  describe('remove', () => {
    it('should throw if user not found', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete user', async () => {
      mockRepo.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.remove(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Deleted user' });
    });
  });
});
