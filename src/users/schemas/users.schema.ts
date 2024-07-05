import { createHash } from 'node:crypto';
import Mongoose from 'mongoose';

export const UsersSchema = new Mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

UsersSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    this['password'] = createHash('sha256')
      .update(this['password'])
      .digest('hex');
  } catch (error) {
    return next(error);
  }
});
