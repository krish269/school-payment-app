import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Order } from './order.schema';

@Schema({ timestamps: true })
export class OrderStatus {
  @Prop({ required: true, unique: true })
  collect_request_id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  order: Order;

  @Prop({ required: true })
  order_amount: number;

  @Prop()
  transaction_amount: number;

  @Prop()
  payment_mode: string;

  @Prop()
  payment_details: string;

  @Prop()
  bank_reference: string;

  @Prop()
  payment_message: string;

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop()
  error_message: string;

  @Prop()
  payment_time: Date;
}

// --- This is the critical addition ---
// Creates and exports the OrderStatusDocument type
export type OrderStatusDocument = OrderStatus & Document;

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);

