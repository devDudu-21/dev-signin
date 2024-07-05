import * as bcrypt from 'bcrypt';
import Mongoose from 'mongoose';

export const UsersSchema = new Mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

UsersSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this['password'], salt);
    this['password'] = hashedPassword;
  } catch (error) {
    return next(error);
  }
});
