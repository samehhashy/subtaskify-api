import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Test } from '@nestjs/testing';
import { User, UserSchema } from './user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { createUserDtoStub } from 'src/test/stubs/create-user.dto.stub';
import { ConflictException } from '@nestjs/common';
import { setupDB, clearDB, teardownDB } from 'src/test/utils';
import { Connection, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('UserController', () => {
  let mongod: MongoMemoryServer;
  let connection: Connection;
  let userController: UserController;
  let userModel: Model<User>;

  beforeAll(async () => {
    const {
      server,
      dbConnection: serverConnection,
      model,
    } = await setupDB<User>(User.name, UserSchema);
    mongod = server;
    connection = serverConnection;
    userModel = model;

    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    userController = moduleRef.get<UserController>(UserController);
  });

  afterAll(async () => {
    await teardownDB(mongod, connection);
  });

  afterEach(async () => {
    await clearDB(connection);
  });

  it('should not allow duplicate users to be created', async () => {
    // Arrange
    await new userModel(createUserDtoStub()).save();

    // Act
    const command = userController.createUser(createUserDtoStub());

    // Assert
    await expect(command).rejects.toBeInstanceOf(ConflictException);
    await expect(command).rejects.toThrow(
      'A user already exists with this email',
    );
  });
});
