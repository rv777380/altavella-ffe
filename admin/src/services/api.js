/**
 * API service for Lourini FFE Admin
 */
import axios from 'axios';
import { getAuthToken } from './auth';

// Create axios instance
const api = axios.create({
  baseURL: 'https://lourini-ffe-api.altavella.workers.dev',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get dashboard metrics
 * @returns {Promise} Dashboard metrics data
 */
export const getDashboardMetrics = async () => {
  try {
    const response = await api.get('/dashboard/metrics');
    return response.data.metrics;
  } catch (error) {
    console.error('Failed to get dashboard metrics:', error);
    throw error;
  }
};

/**
 * Get orders with pagination and filtering
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} status - Status filter
 * @returns {Promise} Orders data
 */
export const getOrders = async (page = 1, limit = 20, status = null) => {
  try {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to get orders:', error);
    throw error;
  }
};

/**
 * Get order details by ID
 * @param {number} orderId - Order ID
 * @returns {Promise} Order details
 */
export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.order;
  } catch (error) {
    console.error(`Failed to get order #${orderId}:`, error);
    throw error;
  }
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise} Update result
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Failed to update order #${orderId} status:`, error);
    throw error;
  }
};

export default api;
