/**
 * Lourini FFE API
 * Cloudflare Worker for the Lourini FFE ordering system
 */

// Utility to generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString().substring(5);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

// Email service
class EmailService {
  constructor(env) {
    this.env = env;
  }
  
  async sendOrderConfirmation(order, customer) {
    try {
      // In a real implementation, you would send emails using Cloudflare Email Workers
      // or a third-party service like SendGrid or Mailgun
      
      console.log(`Order confirmation email would be sent to ${customer.email}`);
      
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }
  
  async sendAdminNotification(order) {
    try {
      // Send notification to admin email
      console.log('Admin notification email would be sent');
      
      return true;
    } catch (error) {
      console.error('Admin notification error:', error);
      return false;
    }
  }
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Handle CORS preflight requests
function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders
  });
}

// Handle order creation
async function createOrder(request, env) {
  try {
    const data = await request.json();
    const { customer, items } = data;
    
    // Validate order data
    if (!customer || !items || items.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid order data'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    // Prepare order data for insertion
    const orderData = {
      orderNumber,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      customerCity: customer.city || 'Lisboa',
      customerPostcode: customer.postcode || '1000',
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Insert order into database
    const { results } = await env.DB.prepare(`
      INSERT INTO orders (
        order_number, 
        customer_first_name, 
        customer_last_name, 
        customer_email, 
        customer_phone, 
        customer_address, 
        customer_city, 
        customer_postcode, 
        total_amount, 
        status, 
        payment_status, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderData.orderNumber,
      orderData.customerFirstName,
      orderData.customerLastName,
      orderData.customerEmail,
      orderData.customerPhone,
      orderData.customerAddress,
      orderData.customerCity,
      orderData.customerPostcode,
      orderData.totalAmount,
      orderData.status,
      orderData.paymentStatus,
      orderData.createdAt
    ).run();
    
    // Get the order ID
    const orderId = results.lastRowId;
    
    // Insert order items
    for (const item of items) {
      await env.DB.prepare(`
        INSERT INTO order_items (
          order_id, 
          product_name, 
          product_category, 
          fabric_class, 
          fabric_name, 
          quantity, 
          unit_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        orderId,
        item.name,
        item.category,
        item.fabricClass || null,
        item.fabricName || null,
        item.quantity || 1,
        item.price
      ).run();
    }
    
    // Send confirmation email
    const emailService = new EmailService(env);
    await emailService.sendOrderConfirmation({ id: orderId, orderNumber, items }, customer);
    await emailService.sendAdminNotification({ id: orderId, orderNumber, items, customer });
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Order created successfully',
      order: {
        id: orderId,
        orderNumber
      }
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to create order',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Handle order retrieval by number
async function getOrderByNumber(request, env, number) {
  try {
    const order = await env.DB.prepare(`
      SELECT 
        o.id,
        o.order_number,
        o.customer_first_name,
        o.customer_last_name,
        o.customer_email,
        o.customer_phone,
        o.total_amount,
        o.status,
        o.payment_status,
        o.created_at
      FROM orders o
      WHERE o.order_number = ?
    `).bind(number).first();
    
    if (!order) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Order not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Get order items
    const { results: items } = await env.DB.prepare(`
      SELECT
        product_name,
        product_category,
        fabric_class,
        fabric_name,
        quantity,
        unit_price
      FROM order_items
      WHERE order_id = ?
    `).bind(order.id).all();
    
    // Return order with items
    return new Response(JSON.stringify({
      success: true,
      order: {
        ...order,
        items
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to retrieve order',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Get all orders (with pagination)
async function getOrders(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Get orders with pagination
    const { results: orders } = await env.DB.prepare(`
      SELECT 
        id,
        order_number,
        customer_first_name,
        customer_last_name,
        customer_email,
        total_amount,
        status,
        payment_status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    // Get total count
    const totalCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM orders
    `).first();
    
    return new Response(JSON.stringify({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Update order status
async function updateOrderStatus(request, env, id) {
  try {
    const { status } = await request.json();
    
    if (!status) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Status is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Update order status
    const result = await env.DB.prepare(`
      UPDATE orders
      SET status = ?
      WHERE id = ?
    `).bind(status, id).run();
    
    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Order status updated successfully'
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Order not found or could not be updated'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Get dashboard metrics
async function getDashboardMetrics(env) {
  try {
    // Get total orders
    const totalOrders = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM orders
    `).first();
    
    // Get total sales
    const totalSales = await env.DB.prepare(`
      SELECT SUM(total_amount) as total FROM orders
    `).first();
    
    // Get orders by status
    const { results: ordersByStatus } = await env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `).all();
    
    // Get recent orders
    const { results: recentOrders } = await env.DB.prepare(`
      SELECT 
        id,
        order_number,
        customer_first_name,
        customer_last_name,
        total_amount,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `).all();
    
    return new Response(JSON.stringify({
      success: true,
      metrics: {
        totalOrders: totalOrders.count,
        totalSales: totalSales.total || 0,
        ordersByStatus,
        recentOrders
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to retrieve dashboard metrics',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }
    
    // Get request URL and path
    const url = new URL(request.url);
    const path = url.pathname;
    
    // API routes
    if (path === '/orders' && request.method === 'POST') {
      return createOrder(request, env);
    }
    
    if (path === '/orders' && request.method === 'GET') {
      return getOrders(request, env);
    }
    
    if (path.match(/\/orders\/track\/([^/]+)/) && request.method === 'GET') {
      const [, orderNumber] = path.match(/\/orders\/track\/([^/]+)/);
      return getOrderByNumber(request, env, orderNumber);
    }
    
    if (path.match(/\/orders\/([0-9]+)\/status/) && request.method === 'PATCH') {
      const [, orderId] = path.match(/\/orders\/([0-9]+)\/status/);
      return updateOrderStatus(request, env, orderId);
    }
    
    if (path === '/dashboard/metrics' && request.method === 'GET') {
      return getDashboardMetrics(env);
    }
    
    // Default response for unknown routes
    return new Response("Not Found", { 
      status: 404,
      headers: corsHeaders
    });
  }
};
