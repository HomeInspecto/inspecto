import { supabase, supabaseAdmin, Database } from './supabase';

// Database utility functions
export class DatabaseService {
  /**
   * Test database connection
   */
  static async testConnection() {
    try {
      // Test with organizations table since it's likely to exist and be accessible
      const { data, error } = await supabase.from('organizations').select('id').limit(1);
      return { success: !error, error };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  /**
   * Generic function to fetch data from any table
   */
  static async fetchData<T>(
    tableName: string, 
    columns: string = '*',
    filters?: Record<string, any>
  ) {
    try {
      let query = supabase.from(tableName).select(columns);
      
      // Apply filters if provided
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          // Only apply filter if value is not null or undefined
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching from ${tableName}:`, error);
      }
      
      return { data, error };
    } catch (err) {
      console.error(`Error in fetchData for table ${tableName}:`, err);
      return { data: null, error: err };
    }
  }

  /**
   * Generic function to fetch data from any table using admin client (bypasses RLS)
   */
  static async fetchDataAdmin<T>(
    tableName: string, 
    columns: string = '*',
    filters?: Record<string, any>
  ) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    try {
      let query = supabaseAdmin.from(tableName).select(columns);
      
      // Apply filters if provided
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          // Only apply filter if value is not null or undefined
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching from ${tableName} (admin):`, error);
      }
      
      return { data, error };
    } catch (err) {
      console.error(`Error in fetchDataAdmin for table ${tableName}:`, err);
      return { data: null, error: err };
    }
  }

  /**
   * Generic function to insert data into any table
   */
  static async insertData<T>(
    tableName: string, 
    data: T
  ) {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select();
      
      return { data: result, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  /**
   * Generic function to insert data into any table using admin client (bypasses RLS)
   */
  static async insertDataAdmin<T>(
    tableName: string, 
    data: T
  ) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    try {
      const { data: result, error } = await supabaseAdmin
        .from(tableName)
        .insert(data)
        .select();
      
      return { data: result, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  /**
   * Generic function to update data in any table
   */
  static async updateData<T>(
    tableName: string, 
    id: string | number,
    updates: Partial<T>
  ) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select();
      
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  /**
   * Generic function to delete data from any table
   */
  static async deleteData(
    tableName: string, 
    id: string | number
  ) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      return { error };
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * Admin function to perform operations with service role
   */
  static async adminOperation<T>(
    operation: (client: typeof supabaseAdmin) => Promise<T>
  ) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    try {
      return await operation(supabaseAdmin);
    } catch (err) {
      throw err;
    }
  }
}

export default DatabaseService;
