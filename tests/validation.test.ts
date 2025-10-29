import { customerRefSchema, pinSchema, loginFormSchema } from '../src/lib/validation';

describe('customerRefSchema', () => {
  describe('valid inputs', () => {
    it('should accept alphanumeric customer reference with minimum length', () => {
      const result = customerRefSchema.safeParse('abc');
      expect(result.success).toBe(true);
    });

    it('should accept alphanumeric customer reference with maximum length', () => {
      const result = customerRefSchema.safeParse('a'.repeat(50));
      expect(result.success).toBe(true);
    });

    it('should accept customer reference with letters, numbers, underscore, and dash', () => {
      const result = customerRefSchema.safeParse('TEST_USER-123');
      expect(result.success).toBe(true);
    });

    it('should accept customer reference with only numbers', () => {
      const result = customerRefSchema.safeParse('12345');
      expect(result.success).toBe(true);
    });

    it('should accept customer reference with only letters', () => {
      const result = customerRefSchema.safeParse('TESTUSER');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject customer reference shorter than 3 characters', () => {
      const result = customerRefSchema.safeParse('ab');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Customer reference must be at least 3 characters');
      }
    });

    it('should reject customer reference longer than 50 characters', () => {
      const result = customerRefSchema.safeParse('a'.repeat(51));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Customer reference must be at most 50 characters');
      }
    });

    it('should reject customer reference with special characters', () => {
      const result = customerRefSchema.safeParse('test@user');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Only letters, numbers, underscore, and dash allowed');
      }
    });

    it('should reject customer reference with spaces', () => {
      const result = customerRefSchema.safeParse('test user');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Only letters, numbers, underscore, and dash allowed');
      }
    });

    it('should reject customer reference with dots', () => {
      const result = customerRefSchema.safeParse('test.user');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Only letters, numbers, underscore, and dash allowed');
      }
    });
  });
});

describe('pinSchema', () => {
  describe('valid inputs', () => {
    it('should accept PIN with minimum length', () => {
      const result = pinSchema.safeParse('1234');
      expect(result.success).toBe(true);
    });

    it('should accept PIN with maximum length', () => {
      const result = pinSchema.safeParse('12345678');
      expect(result.success).toBe(true);
    });

    it('should accept PIN with middle length', () => {
      const result = pinSchema.safeParse('123456');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject PIN shorter than 4 digits', () => {
      const result = pinSchema.safeParse('123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('PIN must be at least 4 digits');
      }
    });

    it('should reject PIN longer than 8 digits', () => {
      const result = pinSchema.safeParse('123456789');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('PIN must be at most 8 digits');
      }
    });

    it('should reject PIN with letters', () => {
      const result = pinSchema.safeParse('12ab');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('PIN must contain only digits');
      }
    });

    it('should reject PIN with special characters', () => {
      const result = pinSchema.safeParse('12@4');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('PIN must contain only digits');
      }
    });

    it('should reject PIN with spaces', () => {
      const result = pinSchema.safeParse('12 34');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('PIN must contain only digits');
      }
    });
  });
});

describe('loginFormSchema', () => {
  it('should accept valid login form data', () => {
    const result = loginFormSchema.safeParse({
      customerRef: 'TEST_USER',
      pin: '1234',
    });
    expect(result.success).toBe(true);
  });

  it('should reject login form with invalid customer reference', () => {
    const result = loginFormSchema.safeParse({
      customerRef: 'ab',
      pin: '1234',
    });
    expect(result.success).toBe(false);
  });

  it('should reject login form with invalid PIN', () => {
    const result = loginFormSchema.safeParse({
      customerRef: 'TEST_USER',
      pin: '123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject login form with both invalid fields', () => {
    const result = loginFormSchema.safeParse({
      customerRef: 'ab',
      pin: '123',
    });
    expect(result.success).toBe(false);
  });
});
