import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Schema } from 'mongoose';

export async function setupDB<T>(
  modelName: string,
  schema: Schema<T>,
): Promise<{
  server: MongoMemoryServer;
  dbConnection: Connection;
  model: Model<T>;
}> {
  const server = await MongoMemoryServer.create();
  const uri = server.getUri();
  const dbConnection = (await connect(uri)).connection;
  const model = dbConnection.model<T>(modelName, schema);

  return {
    server,
    dbConnection,
    model,
  };
}

export async function teardownDB(
  mongod: MongoMemoryServer,
  mongoConnection: Connection,
) {
  await mongoConnection.dropDatabase();
  await mongoConnection.close();
  await mongod.stop();
}

export async function clearDB(mongoConnection: Connection) {
  const collections = mongoConnection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}
