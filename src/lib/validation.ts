import { z } from 'zod';

/**
 * Validation schema for customer reference
 * Requirements: 2.1 - alphanumeric with 3 to 50 characters
 */
export const customerRefSchema = z
  .string()
  .min(3, 'Customer reference must be at least 3 characters')
  .max(50, 'Customer reference must be at most 50 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Only letters, numbers, underscore, and dash allowed'
  );

/**
 * Validation schema for PIN
 * Requirements: 2.2 - numeric with 4 to 8 digits
 */
export const pinSchema = z
  .string()
  .min(4, 'PIN must be at least 4 digits')
  .max(8, 'PIN must be at most 8 digits')
  .regex(/^\d+$/, 'PIN must contain only digits');

/**
 * Validation schema for tenant key
 * Alphanumeric string with minimum 3 characters
 */
export const tenantKeySchema = z
  .string()
  .min(3, 'Tenant key must be at least 3 characters')
  .max(100, 'Tenant key must be at most 100 characters');

/**
 * Combined login form validation schema
 */
export const loginFormSchema = z.object({
  tenantKey: tenantKeySchema,
  customerRef: customerRefSchema,
  pin: pinSchema,
});

/**
 * Type inference for login form data
 */
export type LoginFormData = z.infer<typeof loginFormSchema>;
