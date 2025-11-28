import { supabase } from '../lib/supabaseClient';

/**
 * Wishlist Service
 * Handles all wishlist-related API calls
 */

export const wishlistService = {
  /**
   * Get user's wishlist items with product details
   */
  async getWishlist(userId) {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Add item to wishlist
   */
  async addToWishlist(userId, productId) {
    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: userId,
        product_id: productId
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Item already in wishlist');
      }
      throw error;
    }
    return data;
  },

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(userId, productId) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
    return true;
  },

  /**
   * Check if item is in wishlist
   */
  async isInWishlist(userId, productId) {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  /**
   * Get wishlist count
   */
  async getWishlistCount(userId) {
    const { count, error } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Clear entire wishlist
   */
  async clearWishlist(userId) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  /**
   * Sync localStorage wishlist to database (for migration)
   */
  async syncLocalStorageToDb(userId, localWishlistIds) {
    if (!localWishlistIds || localWishlistIds.length === 0) return;

    const promises = localWishlistIds.map(productId => 
      this.addToWishlist(userId, productId).catch(() => null)
    );

    await Promise.all(promises);
    return true;
  }
};
