import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Schema } from 'mongoose';

interface ISetupDB<T> {
  server: MongoMemoryServer;
  connection: Connection;
  model: Model<T>;
}

export async function setupDB<T>(
  modelName: string,
  schema: Schema<T>,
): Promise<ISetupDB<T>> {
  const server = await MongoMemoryServer.create();
  const connection = (await connect(server.getUri())).connection;

  return {
    server,
    connection,
    model: connection.model<T>(modelName, schema),
  };
}

export async function teardownDB(
  mongod: MongoMemoryServer,
  connection: Connection,
) {
  await connection.dropDatabase();
  await connection.close();
  await mongod.stop();
}

export async function clearDB(connection: Connection) {
  const collections = connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}
