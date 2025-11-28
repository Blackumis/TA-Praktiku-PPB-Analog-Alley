import { supabase } from '../lib/supabaseClient';

/**
 * Products Service
 * Handles all product-related API calls
 */

export const productsService = {
  /**
   * Get all products with optional filtering and pagination
   */
  async getProducts({ 
    page = 1, 
    limit = 10, 
    sortBy = 'created_at', 
    sortOrder = 'desc',
    filters = {} 
  } = {}) {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Create a new product
   */
  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(id, updates) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Search products by name or description
   */
  async searchProducts(searchTerm, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  /**
   * Get reviews for a product
   */
  async getProductReviews(productId) {
    try {
      console.log('Fetching reviews for product:', productId);
      
      // Fetch reviews
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }

      // Fetch user profiles for each review
      if (reviews && reviews.length > 0) {
        const userIds = [...new Set(reviews.map(r => r.user_id))];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        // Map profiles to reviews
        const profileMap = {};
        if (profiles) {
          profiles.forEach(p => {
            profileMap[p.id] = p;
          });
        }

        // Attach profile to each review
        reviews.forEach(review => {
          review.profiles = profileMap[review.user_id] || null;
        });
      }

      console.log('Fetched reviews:', reviews);
      return reviews || [];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  },

  /**
   * Add a review for a product
   */
  async addProductReview(userId, productId, reviewData) {
    try {
      // Check if user already reviewed this product
      const { data: existingReviews, error: checkError } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (checkError) {
        console.error('Error checking existing review:', checkError);
      }

      if (existingReviews && existingReviews.length > 0) {
        throw new Error('You have already reviewed this product');
      }

      // Insert the review
      const { data: review, error: reviewError } = await supabase
        .from('product_reviews')
        .insert({
          user_id: userId,
          product_id: productId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          is_verified_purchase: reviewData.is_verified_purchase || false,
          helpful_count: 0
        })
        .select()
        .single();

      if (reviewError) {
        // Check for unique constraint violation
        if (reviewError.code === '23505') {
          throw new Error('You have already reviewed this product');
        }
        throw reviewError;
      }

      // Update product rating stats
      await this.updateProductRating(productId);

      return review;
    } catch (error) {
      console.error('Error adding product review:', error);
      throw error;
    }
  },

  /**
   * Update a review
   */
  async updateProductReview(reviewId, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .update({
          rating: updates.rating,
          comment: updates.comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update product rating stats
      if (data) {
        await this.updateProductRating(data.product_id);
      }

      return data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  /**
   * Delete a review
   */
  async deleteProductReview(reviewId, userId) {
    try {
      // Get the review first to know the product_id
      const { data: review } = await supabase
        .from('product_reviews')
        .select('product_id')
        .eq('id', reviewId)
        .eq('user_id', userId)
        .single();

      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update product rating stats
      if (review) {
        await this.updateProductRating(review.product_id);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(reviewId, userId) {
    try {
      // Check if user already marked this review
      const { data: existing } = await supabase
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Remove the helpful mark
        await supabase
          .from('review_helpful')
          .delete()
          .eq('id', existing.id);

        // Decrement helpful count
        await supabase.rpc('decrement_helpful_count', { review_id: reviewId });
        
        return { action: 'removed' };
      } else {
        // Add helpful mark
        await supabase
          .from('review_helpful')
          .insert({
            review_id: reviewId,
            user_id: userId
          });

        // Increment helpful count
        await supabase.rpc('increment_helpful_count', { review_id: reviewId });

        return { action: 'added' };
      }
    } catch (error) {
      console.error('Error marking review helpful:', error);
      // Fallback: just increment the count directly
      try {
        const { data, error: updateError } = await supabase
          .from('product_reviews')
          .select('helpful_count')
          .eq('id', reviewId)
          .single();

        if (!updateError && data) {
          await supabase
            .from('product_reviews')
            .update({ helpful_count: (data.helpful_count || 0) + 1 })
            .eq('id', reviewId);
        }
        return { action: 'added' };
      } catch (e) {
        throw error;
      }
    }
  },

  /**
   * Update product rating average and count
   */
  async updateProductRating(productId) {
    try {
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) throw error;

      const ratingCount = reviews?.length || 0;
      const ratingAverage = ratingCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
        : 0;

      await supabase
        .from('products')
        .update({
          rating_count: ratingCount,
          rating_average: Math.round(ratingAverage * 10) / 10
        })
        .eq('id', productId);

      return { rating_count: ratingCount, rating_average: ratingAverage };
    } catch (error) {
      console.error('Error updating product rating:', error);
    }
  },

  /**
   * Check if user has reviewed a product
   */
  async hasUserReviewed(userId, productId) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error checking user review:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking user review:', error);
      return false;
    }
  },

  /**
   * Increment product views
   */
  async incrementProductViews(productId) {
    try {
      const { data } = await supabase
        .from('products')
        .select('views_count')
        .eq('id', productId)
        .single();

      await supabase
        .from('products')
        .update({ views_count: (data?.views_count || 0) + 1 })
        .eq('id', productId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },
};
