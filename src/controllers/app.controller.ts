import { Controller, Get } from '@nestjs/common';


@Controller()
export class AppController {
  constructor() {}

  @Get('message')
  getHello(): string {
    return "Hello Country Quiz!";
  }
}
