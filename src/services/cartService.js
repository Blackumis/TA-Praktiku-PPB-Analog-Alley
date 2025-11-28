import { supabase } from '../lib/supabaseClient';

/**
 * Cart Service
 * Handles all cart-related API calls
 */

export const cartService = {
  /**
   * Get user's cart items with product details
   */
  async getCart(userId) {
    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  /**
   * Add item to cart or update quantity if exists
   */
  async addToCart(userId, productId, quantity = 1) {
    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('cart')
        .update({ 
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  /**
   * Update cart item quantity
   */
  async updateQuantity(cartItemId, quantity) {
    const { data, error } = await supabase
      .from('cart')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    return true;
  },

  /**
   * Clear entire cart
   */
  async clearCart(userId) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  /**
   * Get cart count
   */
  async getCartCount(userId) {
    const { count, error } = await supabase
      .from('cart')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Sync localStorage cart to database (for migration)
   */
  async syncLocalStorageToDb(userId, localCartItems) {
    if (!localCartItems || localCartItems.length === 0) return;

    const promises = localCartItems.map(item => 
      this.addToCart(userId, item.id, item.quantity || 1)
    );

    await Promise.all(promises);
    return true;
  }
};
