import { ZodError } from 'zod';

/**
 * Middleware factory to validate request data using Zod schemas
 * @param {Object} schema - Zod schema object with body, params, query properties
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request body if schema.body exists
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Validate request params if schema.params exists
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      // Validate request query if schema.query exists
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      // Pass other errors to error handler middleware
      next(error);
    }
  };
};
