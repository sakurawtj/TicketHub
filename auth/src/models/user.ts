import mongoose from "mongoose";
import { Password } from "../services/password";

// interface that describes the properties that are required to create a new user
interface UserAttrs {
    email: string,
    password: string
}

// interface that describe the property that a user model has a build function
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// interface that describes the properties that a user document has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.pre('save', async function(done) {
    if(this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
})

// solve the issue between typescript and mongo
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);


export { User };