import { supabase } from '../lib/supabaseClient';

/**
 * Orders Service
 * Handles all order-related API calls
 */

export const ordersService = {
  /**
   * Get all orders for a user
   */
  async getUserOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get single order by ID
   */
  async getOrderById(orderId, userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new order
   * Matches the exact database schema for orders and order_items tables
   */
  async createOrder(userId, orderData) {
    const { items, shipping_address, ...orderInfo } = orderData;

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Build order payload matching exact database schema
    const orderPayload = {
      user_id: userId,
      order_number: orderNumber,
      status: 'processing',
      payment_status: 'pending',
      payment_method: orderInfo.payment_method || 'card',
      subtotal: orderInfo.subtotal || 0,
      shipping_cost: orderInfo.shipping_cost || 0,
      tax: orderInfo.tax || 0,
      discount: orderInfo.discount || 0,
      total: orderInfo.total || 0,
      currency: 'IDR',
      shipping_address: shipping_address || null,
      billing_address: shipping_address || null,
      notes: orderInfo.notes || null
    };

    console.log('Creating order with payload:', orderPayload);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message || 'Unknown error'}`);
    }

    console.log('Order created:', order);

    // Create order items matching exact database schema
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id || item.id,
      product_name: item.product_name || 'Unknown Product',
      quantity: item.quantity || 1,
      unit_price: item.unit_price || item.price || 0,
      total_price: (item.unit_price || item.price || 0) * (item.quantity || 1),
      product_snapshot: item.product_snapshot || null
    }));

    console.log('Creating order items:', orderItems);

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Order was created, log warning but don't fail completely
      console.warn('Order created but items failed. Order ID:', order.id);
    }

    return {
      ...order,
      order_items: createdItems || []
    };
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, userId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId, userId) {
    return this.updateOrderStatus(orderId, userId, 'cancelled');
  },

  /**
   * Get orders by status
   */
  async getOrdersByStatus(userId, status) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get order statistics
   */
  async getOrderStats(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data.length,
      processing: data.filter(o => o.status === 'processing').length,
      shipped: data.filter(o => o.status === 'shipped').length,
      delivered: data.filter(o => o.status === 'delivered').length,
      cancelled: data.filter(o => o.status === 'cancelled').length
    };

    return stats;
  },

  // ============ SELLER METHODS ============

  /**
   * Get all orders for seller (all orders in the system)
   * In a real app, this would filter by seller's products
   */
  async getAllOrders() {
    // First, get all orders with items
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!orders || orders.length === 0) return [];

    // Get unique user IDs
    const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];
    
    // Fetch profiles for these users
    let profilesMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url')
        .in('id', userIds);
      
      if (profiles) {
        profilesMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
    }
    
    // Transform the data to include customer info
    return orders.map(order => {
      const profile = profilesMap[order.user_id] || {};
      return {
        ...order,
        customer_name: profile.full_name || 'Unknown Customer',
        customer_email: profile.email || 'N/A',
        items_count: order.order_items?.length || 0
      };
    });
  },

  /**
   * Update order status (for seller - no user_id check)
   */
  async updateOrderStatusBySeller(orderId, status) {
    console.log('Updating order status:', { orderId, status });
    
    // Update the order status
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .single();

    if (error) {
      console.error('Order status update error:', error);
      throw new Error(error.message || 'Failed to update order status. Check RLS policies.');
    }
    
    // Fetch the profile separately
    let profile = {};
    if (order.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('id', order.user_id)
        .single();
      
      if (profileData) {
        profile = profileData;
      }
    }
    
    return {
      ...order,
      customer_name: profile.full_name || 'Unknown Customer',
      customer_email: profile.email || 'N/A',
      items_count: order.order_items?.length || 0
    };
  },

  /**
   * Get order details for seller
   */
  async getOrderDetailsBySeller(orderId) {
    // Get order with items
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    
    // Fetch the profile separately
    let profile = {};
    if (order.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url')
        .eq('id', order.user_id)
        .single();
      
      if (profileData) {
        profile = profileData;
      }
    }
    
    return {
      ...order,
      customer_name: profile.full_name || 'Unknown Customer',
      customer_email: profile.email || 'N/A',
      customer_phone: profile.phone || 'N/A',
      customer_avatar: profile.avatar_url || null,
      items_count: order.order_items?.length || 0
    };
  },

  /**
   * Get seller order statistics
   */
  async getSellerOrderStats() {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total');

    if (error) throw error;

    const stats = {
      total: data.length,
      pending: data.filter(o => o.status === 'pending').length,
      processing: data.filter(o => o.status === 'processing').length,
      shipped: data.filter(o => o.status === 'shipped').length,
      delivered: data.filter(o => o.status === 'delivered').length,
      cancelled: data.filter(o => o.status === 'cancelled').length,
      totalRevenue: data
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total || 0), 0)
    };

    return stats;
  }
};
