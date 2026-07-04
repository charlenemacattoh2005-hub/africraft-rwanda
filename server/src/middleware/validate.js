import { validationResult } from 'express-validator';

export function validateResult(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }
  return next();
}

