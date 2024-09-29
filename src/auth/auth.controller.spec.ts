import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { AppModule } from 'src/app.module';
import { ValidateObjectIdPipe } from 'src/common/pipes/validateObjectId.pipe';
import { createUserDtoStub } from 'src/test/stubs/create-user.dto.stub';
import { clearDB, setupDB, teardownDB } from 'src/test/utils';
import * as request from 'supertest';
import { User, UserSchema } from '../user/user.schema';

let server: MongoMemoryServer;
let dbConnection: Connection;
let app: INestApplication;
let userModel: Model<User>;

beforeAll(async () => {
  const db = await setupDB<User>(User.name, UserSchema);
  server = db.server;
  dbConnection = db.connection;
  userModel = db.model;

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(getModelToken(User.name))
    .useValue(userModel)
    .compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe(), new ValidateObjectIdPipe());
  await app.init();
});

afterAll(async () => {
  await clearDB(dbConnection);
  await teardownDB(server, dbConnection);
  await app.close();
});

describe('AuthController (integration)', () => {
  describe('Register', () => {
    // Arrange
    const user = createUserDtoStub();
    afterEach(async () => {
      await clearDB(dbConnection);
    });

    it('should register a user and respond with the access token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(201);

      // Assert
      expect(response.body).toEqual({ accessToken: expect.any(String) });
    });

    it('should not allow registering a user with a duplicate email address', async () => {
      // Arrange
      (await userModel.create(user)).save(); // Ensure a user with the same email exists before registering

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(409);

      // Assert
      expect(response.body.message).toBe(
        'A user already exists with this email',
      );
    });

    it.each([
      [
        'password',
        '12345',
        'Password must be longer than or equal to 6 characters',
      ],
      ['email', 'invalid-email', 'Email is invalid'],
      ['firstName', '', 'First name is required'],
      ['lastName', 123, 'Last name must be a string'],
    ])(
      'should not allow registering a user with an invalid %s',
      async (field, value, message) => {
        // Arrange
        const invalidUser = createUserDtoStub({ [field]: value });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(invalidUser)
          .expect(400);

        // Assert
        expect(response.body.message).toEqual([message]);
      },
    );
  });

  describe('Login', () => {
    // Arrange
    const user = createUserDtoStub();
    beforeAll(async () => {
      await clearDB(dbConnection);
      await request(app.getHttpServer()).post('/auth/register').send(user);
    });

    it('should login a user given the correct credentials and respond back with the access token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(201);

      // Assert
      expect(response.body).toEqual({ accessToken: expect.any(String) });
    });

    it('should not allow login with an incorrect email', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `incorrect-${user.email}`,
          password: user.password,
        })
        .expect(404);

      // Assert
      expect(response.body.message).toBe('No user found with this email');
    });

    it('should not allow login with an incorrect password', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: `incorrect-${user.password}` })
        .expect(401);

      // Assert
      expect(response.body.message).toBe('Password is incorrect');
    });
  });

  describe('Profile', () => {
    // Arrange
    const user = createUserDtoStub();
    let accessToken: string;
    beforeAll(async () => {
      await clearDB(dbConnection);
      const { body } = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user);
      accessToken = body.accessToken;
    });

    it('should not allow accessing the profile of a user without a valid access token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);

      // Assert
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should respond with the profile of the currently logged in user', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        _id: expect.any(String),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      });
    });
  });
});
