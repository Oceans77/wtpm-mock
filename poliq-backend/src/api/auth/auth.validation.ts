import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    displayName: Joi.string().min(2).max(100).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};
