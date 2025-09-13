import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';

import { Order, OrderDocument } from '../schemas/order.schema';
import {
  OrderStatus,
  OrderStatusDocument,
} from '../schemas/order-status.schema';
import { WebhookPayloadDto, CreatePaymentDto } from './payment.controller';

export interface TransactionDetails {
  collect_id: string;
  school_id: string;
  gateway: string;
  order_amount: number;
  transaction_amount?: number;
  status: string;
  custom_order_id: string;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name)
    private orderStatusModel: Model<OrderStatusDocument>,
    private readonly httpService: HttpService,
  ) {}

  // ... createPayment and handleWebhook methods remain the same ...
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    const customOrderId = `ORD-${uuidv4()}`;
    const newOrder = new this.orderModel({
      school_id: process.env.SCHOOL_ID!,
      student_info: createPaymentDto.student_info,
      gateway_name: 'Edviron-Vanilla',
      custom_order_id: customOrderId,
    });
    const savedOrder = await newOrder.save();
    const signPayload = {
      school_id: process.env.SCHOOL_ID!,
      amount: createPaymentDto.amount.toString(),
      callback_url: process.env.CALLBACK_URL!,
    };
    const sign = jwt.sign(signPayload, process.env.PG_SECRET_KEY!);
    const requestBody = {
      school_id: process.env.SCHOOL_ID!,
      amount: createPaymentDto.amount.toString(),
      callback_url: process.env.CALLBACK_URL!,
      sign: sign,
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PG_API_KEY!}`,
    };
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          process.env.PAYMENT_API_URL!,
          requestBody,
          { headers },
        ),
      );
      const responseData = response.data;
      const orderStatus = new this.orderStatusModel({
        collect_request_id: responseData.collect_request_id,
        order: savedOrder._id,
        order_amount: createPaymentDto.amount,
        status: 'PENDING',
      });
      await orderStatus.save();
      return { paymentUrl: responseData.collect_request_url };
    } catch (error) {
      console.error(
        '--- DETAILED PAYMENT CREATION ERROR ---',
        error.response ? error.response.data : error,
      );
      throw new HttpException(
        'Failed to create payment link.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async handleWebhook(
    payload: WebhookPayloadDto,
  ): Promise<{ status: string; message: string }> {
    const { order_info } = payload;
    const collectRequestId = order_info.order_id;
    console.log(
      `--- WEBHOOK RECEIVED for collect_request_id: ${collectRequestId} ---`,
    );
    const orderStatusToUpdate = await this.orderStatusModel
      .findOne({ collect_request_id: collectRequestId })
      .exec();
    if (!orderStatusToUpdate) {
      throw new NotFoundException(
        `Transaction with collect_request_id ${collectRequestId} not found.`,
      );
    }
    const paymentDetails = order_info.payemnt_details || '';
    const paymentMessage = order_info.Payment_message || '';
    orderStatusToUpdate.status = order_info.status.toUpperCase();
    orderStatusToUpdate.transaction_amount = order_info.transaction_amount;
    orderStatusToUpdate.payment_mode = order_info.payment_mode;
    orderStatusToUpdate.payment_details = paymentDetails;
    orderStatusToUpdate.bank_reference = order_info.bank_reference;
    orderStatusToUpdate.payment_message = paymentMessage;
    orderStatusToUpdate.payment_time = new Date(order_info.payment_time);
    orderStatusToUpdate.error_message = order_info.error_message;
    await orderStatusToUpdate.save();
    console.log(
      `--- SUCCESSFULLY UPDATED status for collect_request_id: ${collectRequestId} to ${orderStatusToUpdate.status} ---`,
    );
    return { status: 'success', message: 'Webhook processed' };
  }


  async getAllTransactions(
    page: number,
    limit: number,
    status: string,
    search: string,
    sortBy: string,
    sortOrder: 'asc' | 'desc',
  ): Promise<TransactionDetails[]> {
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortField = sortBy || 'status_info.payment_time';

    // The aggregation pipeline is now an array of stages
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'order',
          as: 'status_info',
        },
      },
      { $unwind: '$status_info' },
    ];

    // --- Search Stage ---
    // If a search term is provided, add a $match stage to filter the results.
    // This performs a case-insensitive search on multiple fields.
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'status_info.collect_request_id': { $regex: search, $options: 'i' } },
            { custom_order_id: { $regex: search, $options: 'i' } },
            { 'status_info.status': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }
    
    // --- Status Filter Stage ---
    if (status && status.toLowerCase() !== 'all') {
        pipeline.push({
            $match: {
                'status_info.status': status.toUpperCase()
            }
        });
    }

    // --- Final Projection and Sorting ---
    pipeline.push(
      {
        $project: {
          _id: 0,
          collect_id: '$status_info.collect_request_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: 1,
        },
      },
      { $sort: { [sortField]: sortDirection } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
    );

    return this.orderModel.aggregate<TransactionDetails>(pipeline).exec();
  }

  // ... getTransactionsBySchool and getTransactionStatus methods remain the same ...
  async getTransactionsBySchool(schoolId: string): Promise<OrderDocument[]> {
    const orders = await this.orderModel.find({ school_id: schoolId }).exec();
    if (!orders || orders.length === 0) {
      throw new NotFoundException(`No transactions found for school ID ${schoolId}`);
    }
    return orders;
  }
  async getTransactionStatus(
    customOrderId: string,
  ): Promise<{ status: string }> {
    const order = await this.orderModel
      .findOne({ custom_order_id: customOrderId })
      .exec();
    if (!order) {
      throw new NotFoundException(
        `Transaction with custom order ID ${customOrderId} not found.`,
      );
    }
    const orderStatus = await this.orderStatusModel
      .findOne({ order: order._id })
      .exec();
    if (!orderStatus) {
      throw new NotFoundException(
        `Status not found for transaction ${customOrderId}.`,
      );
    }
    return { status: orderStatus.status };
  }
}

