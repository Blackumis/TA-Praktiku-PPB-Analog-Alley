/**
 * API Service Index
 * Central export point for all API services
 */

export { authService } from './authService';
export { productsService } from './productsService';
export { profileService } from './profileService';
export { ordersService } from './ordersService';
export { cartService } from './cartService';
export { wishlistService } from './wishlistService';

/**
 * Generic API error handler
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.message) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
  };
};

/**
 * Generic API response formatter
 */
export const formatApiResponse = (data, error = null) => {
  if (error) {
    return {
      success: false,
      data: null,
      error: error.message || 'An error occurred',
    };
  }

  return {
    success: true,
    data,
    error: null,
  };
};
