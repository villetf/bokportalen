import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

// Valideringsfunktion för att validera att en input matchar en viss DTO
export function validateDto<T extends object>(dtoClass: ClassConstructor<T>) {
   return async(req: Request, res: Response, next: NextFunction) => {
      const instance = plainToInstance(dtoClass, req.body, {
         excludeExtraneousValues: true,
      });

      const errors = await validate(instance);

      const allowedKeys = Object.keys(instance);
      const originalKeys = Object.keys(req.body);

      const extraKeys = originalKeys.filter(key => !allowedKeys.includes(key));

      if (extraKeys.length > 0) {
         res.status(400).json({
            message: 'Unexpected properties in request body',
            extraFields: extraKeys
         });
         return;
      }

      if (errors.length > 0) {
         res.status(400).json({
            message: 'Validation failed',
            errors: errors.map(err => ({
               property: err.property,
               constraints: err.constraints
            }))
         });
         return;
      }

      req.body = instance;

      next();
   };
}