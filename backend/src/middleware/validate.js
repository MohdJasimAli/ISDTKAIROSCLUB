import { fail } from '../utils/ApiResponse.js';

/** Validate req[source] against a zod schema; 422 with field errors on failure. */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return fail(res, 'Validation failed', 422, result.error.flatten().fieldErrors);
    }
    req[source] = result.data;
    next();
  };
}
