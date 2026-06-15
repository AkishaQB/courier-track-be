/**
 * Generic Zod validation middleware.
 *
 * Usage in route files:
 *   router.post("/", validate({ body: mySchema }), handler);
 *   router.get("/",  validate({ query: querySchema }), handler);
 *   router.get("/:id", validate({ params: paramSchema }), handler);
 *
 * On validation failure → 400 with structured error details.
 * On success → replaces req.body/query/params with parsed values
 * (applies defaults, coercion, transforms) and calls next().
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type ValidationTarget = "body" | "query" | "params";

type ValidationSchemas = Partial<Record<ValidationTarget, ZodSchema>>;

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const [target, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[target as ValidationTarget]);

      if (!result.success) {
        res.status(400).json({
          error: "Validation failed",
          details: formatZodErrors(result.error),
        });
        return;
      }

      // Replace with parsed values (applies defaults, coercion, transforms)
      (req as any)[target] = result.data;
    }

    next();
  };
}

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
