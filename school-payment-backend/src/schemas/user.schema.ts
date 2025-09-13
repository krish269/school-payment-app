import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Document } from 'mongoose'; // Import the Mongoose Document type

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

// Create a more accurate type that combines our User class with a Mongoose Document
export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

// Use the new UserDocument type to correctly type `this` inside the hook
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

