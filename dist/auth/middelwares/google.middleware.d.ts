import { NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
export declare class GoogleMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: () => void): void;
}
