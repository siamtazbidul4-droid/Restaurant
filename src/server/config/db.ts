import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let mongoMemoryServer: any = null;

export async function connectDB(): Promise<string> {
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    // In production a missing database URI must fail fast: silently falling back
    // to an ephemeral in-memory database would lose all production data on restart.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[Database] Refusing to start in production: MONGODB_URI is not configured.'
      );
    }
    console.log('[Database] MONGODB_URI not provided. Initializing local persistent MongoDB instance...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const dbPath = path.resolve(process.cwd(), '.data/mongo');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
        },
      });

      mongoUri = mongoMemoryServer.getUri();
      console.log(`[Database] Local persistent MongoDB started at ${mongoUri}`);
    } catch (err: any) {
      console.warn('[Database] Persistent MongoMemoryServer initialization fallback:', err.message);
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      mongoUri = mongoMemoryServer.getUri();
      console.log(`[Database] Ephemeral MongoMemoryServer started at ${mongoUri}`);
    }
  } else {
    console.log(`[Database] Connecting to configured MONGODB_URI...`);
  }

  if (!mongoUri) {
    throw new Error('[Database] Unable to resolve a MongoDB connection URI.');
  }

  await mongoose.connect(mongoUri, {
    dbName: 'aurelia_restaurant',
  });

  console.log('[Database] Mongoose connected successfully.');
  return mongoUri;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
