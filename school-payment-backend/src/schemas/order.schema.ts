import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'; // <-- Import Document

// Defines the embedded student info object
@Schema()
export class StudentInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  email: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  school_id: string;

  @Prop({ type: StudentInfo, required: true })
  student_info: StudentInfo;

  @Prop({ required: true })
  gateway_name: string;

  @Prop({ unique: true, required: true })
  custom_order_id: string;
}

// --- This is the critical addition ---
// Creates and exports the OrderDocument type for use in our service
export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);

