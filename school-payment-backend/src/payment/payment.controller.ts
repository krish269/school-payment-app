import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Data Transfer Objects (DTOs) ---
// These remain the same as they define the structure for creating payments and handling webhooks.
class StudentInfoDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  email: string;
}
export class CreatePaymentDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => StudentInfoDto)
  student_info: StudentInfoDto;
  @IsNumber()
  amount: number;
}
class OrderInfoDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;
  @IsNumber()
  order_amount: number;
  @IsNumber()
  transaction_amount: number;
  @IsString()
  gateway: string;
  @IsString()
  bank_reference: string;
  @IsString()
  status: string;
  @IsString()
  payment_mode: string;
  @IsOptional()
  @IsString()
  payemnt_details?: string;
  @IsOptional()
  @IsString()
  Payment_message?: string;
  @IsDateString()
  payment_time: string;
  @IsString()
  error_message: string;
}
export class WebhookPayloadDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => OrderInfoDto)
  order_info: OrderInfoDto;
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment')
  async createPayment(
    @Body(new ValidationPipe()) createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Post('webhook')
  handleWebhook(@Body(new ValidationPipe()) payload: WebhookPayloadDto) {
    return this.paymentService.handleWebhook(payload);
  }

  @Get('transactions')
  @UseGuards(AuthGuard('jwt'))
  getAllTransactions(
    // --- This is the updated section ---
    // We add new @Query decorators to read the search and sort parameters from the URL.
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status: string = 'all',
    @Query('search') search: string = '',
    @Query('sortBy') sortBy: string = 'payment_time',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    // Pass all the received parameters to the service method.
    return this.paymentService.getAllTransactions(
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get('transactions/school/:schoolId')
  @UseGuards(AuthGuard('jwt'))
  getTransactionsBySchool(@Param('schoolId') schoolId: string) {
    return this.paymentService.getTransactionsBySchool(schoolId);
  }

  @Get('transaction-status/:customOrderId')
  @UseGuards(AuthGuard('jwt'))
  getTransactionStatus(@Param('customOrderId') customOrderId: string) {
    return this.paymentService.getTransactionStatus(customOrderId);
  }
}

