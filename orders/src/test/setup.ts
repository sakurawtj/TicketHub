import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: () => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
    jest.clearAllMocks();
    process.env.JWT_KEY = 'asdfgh';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
})

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    // delete all data before each test
    for(let collection of collections) {
        await collection.deleteMany({});
    }
}) 

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

// faking authentication
global.signin = () => {
   // build a JWT payload {id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
    };


   // create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

   // build session object {jwt: MY_JWT}
    const session = {jwt: token};

   // turn the session to json
    const sessionJson = JSON.stringify(session);

   // take json and encode it as base 64
    const base64 = Buffer.from(sessionJson).toString('base64');

   // return a cookie string with encoded data
    return [`session=${base64}`];

}