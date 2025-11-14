/**
 * Testing utilities for registration flow
 */

/**
 * Generate a unique email address for testing
 * @param {string} prefix - Optional prefix for the email
 * @returns {string} - Unique email address
 */
export const generateUniqueEmail = (prefix = 'test') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}@test.com`;
};

/**
 * Generate a unique username
 * @param {string} prefix - Optional prefix for the username
 * @returns {string} - Unique username
 */
export const generateUniqueUsername = (prefix = 'user') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Normalize email (lowercase and trim)
 * @param {string} email - Email to normalize
 * @returns {string} - Normalized email
 */
export const normalizeEmail = (email) => {
  return String(email).trim().toLowerCase();
};

/**
 * Create test user data with unique email
 * @param {object} overrides - Optional overrides for user data
 * @returns {object} - Test user data object
 */
export const createTestUserData = (overrides = {}) => {
  const uniqueEmail = generateUniqueEmail();
  return {
    firstName: 'Test',
    lastName: 'User',
    email: uniqueEmail,
    password: 'Test123456',
    dateOfBirth: '1990-01-01',
    height: 170,
    weight: 70,
    gender: 'male',
    diabetes: false,
    cholesterol: false,
    otherMedicalStatus: '',
    dietaryPreferences: [],
    ...overrides,
  };
};

