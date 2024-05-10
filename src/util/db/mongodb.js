import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// Check the MongoDB URI
if (!MONGODB_URI) {
    throw new Error('Define the MONGODB_URI environmental variable');
}

// Check the MongoDB DB
if (!MONGODB_DB) {
    throw new Error('Define the MONGODB_DB environmental variable');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToMongoDatabase() {

    // If the cache is present, use it.
    if (cachedClient && cachedDb) {
        // Make sure the client is connected
        return {
            client: cachedClient,
            db: cachedDb,
        };
    }

    // Set the connection options
    const opts = {
        serverApi: ServerApiVersion.v1
    };

    const client = new MongoClient(MONGODB_URI, opts);

    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(MONGODB_DB);

        // Cache the database connection
        cachedClient = client;
        cachedDb = db;

        return {
            client: cachedClient,
            db: cachedDb,
        };
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw new Error('Failed to connect to MongoDB');
    }
}