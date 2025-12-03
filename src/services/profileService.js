import { supabase } from '../lib/supabaseClient';

/**
 * Profile Service
 * Handles all user profile-related API calls
 */

export const profileService = {
  /**
   * Get user profile by user ID
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create user profile (called after sign up)
   */
  async createProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(userId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(file => `${userId}/${file.name}`);
        await supabase.storage
          .from('avatars')
          .remove(filesToRemove);
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await this.updateProfile(userId, { avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
  },

  /**
   * Get user addresses
   */
  async getAddresses(userId) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get address by ID
   */
  async getAddressById(addressId, userId) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; 
    return data;
  },

  /**
   * Get default address
   */
  async getDefaultAddress(userId) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; 
    return data;
  },

  /**
   * Add new address
   */
  async addAddress(userId, addressData) {
    const { data: existingAddresses } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', userId);

    const isFirstAddress = !existingAddresses || existingAddresses.length === 0;

    if (addressData.is_default || isFirstAddress) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        ...addressData,
        is_default: addressData.is_default || isFirstAddress 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update address
   */
  async updateAddress(addressId, userId, updates) {
    if (updates.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Set address as default
   */
  async setDefaultAddress(addressId, userId) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    const { data, error } = await supabase
      .from('addresses')
      .update({ 
        is_default: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete address
   */
  async deleteAddress(addressId, userId) {
    const address = await this.getAddressById(addressId, userId);
    
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) throw error;

    if (address?.is_default) {
      const { data: remainingAddresses } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (remainingAddresses && remainingAddresses.length > 0) {
        await this.setDefaultAddress(remainingAddresses[0].id, userId);
      }
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    // Get order count
    const { count: orderCount, error: orderError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (orderError) throw orderError;

    // Get total spent from delivered orders
    const { data: orders, error: totalError } = await supabase
      .from('orders')
      .select('total')
      .eq('user_id', userId);

    if (totalError) throw totalError;

    const totalSpent = orders?.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0) || 0;

    // Get wishlist count from database
    const { count: wishlistCount, error: wishlistError } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (wishlistError) {
      console.warn('Wishlist count error:', wishlistError.message);
    }

    return {
      totalOrders: orderCount || 0,
      totalSpent,
      wishlistCount: wishlistCount || 0
    };
  }
};
