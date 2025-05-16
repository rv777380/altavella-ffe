/**
 * API client for interacting with the Lourini FFE backend
 */
class APIClient {
  /**
   * Create a new API client
   * @param {string} baseURL - Base URL for API requests
   */
  constructor(baseURL) {
    this.baseURL = baseURL || 'https://lourini-ffe-api.altavella.workers.dev';
  }

  /**
   * Submit an order
   * @param {Object} orderData - Order data with customer info and items
   * @returns {Promise} - Promise resolving to order response
   */
  async submitOrder(orderData) {
    try {
      const response = await fetch(`${this.baseURL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error submitting order');
      }

      return await response.json();
    } catch (error) {
      console.error('Order submission error:', error);
      throw error;
    }
  }

  /**
   * Track an order
   * @param {string} orderNumber - Order number to track
   * @returns {Promise} - Promise resolving to order tracking data
   */
  async trackOrder(orderNumber) {
    try {
      const response = await fetch(`${this.baseURL}/orders/track/${orderNumber}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error tracking order');
      }

      return await response.json();
    } catch (error) {
      console.error('Order tracking error:', error);
      throw error;
    }
  }
}

export default APIClient;
