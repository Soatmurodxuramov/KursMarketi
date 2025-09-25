import supabase from './supabase';

export interface PaymentIntentData {
  course_id: string;
  amount: number;
}

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  status: string;
}

export class PaymentService {
  // Create payment intent for course purchase
  static async createPaymentIntent(courseId: string): Promise<{ data: StripePaymentIntent | null; error: any }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Authentication required');
      }

      // Get course details
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, title, price')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        throw new Error('Course not found');
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', session.session.user.id)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        throw new Error('Already enrolled in this course');
      }

      // Call Supabase Edge Function to create Stripe payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          course_id: courseId,
          amount: Math.round(course.price * 100), // Convert to cents
          course_title: course.title,
          user_id: session.session.user.id
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Confirm payment and enroll user
  static async confirmPayment(paymentIntentId: string, courseId: string) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Authentication required');
      }

      // Call Edge Function to confirm payment
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: {
          payment_intent_id: paymentIntentId,
          course_id: courseId,
          user_id: session.session.user.id
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get user purchases
  static async getUserPurchases() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          course:course_id(
            id, title, thumbnail_url, price,
            instructor:instructor_id(full_name, username)
          )
        `)
        .eq('user_id', session.session.user.id)
        .eq('status', 'completed')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Enroll user in course (after successful payment)
  static async enrollUser(courseId: string, paymentIntentId: string) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Authentication required');
      }

      // Create enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: session.session.user.id,
          course_id: courseId,
          status: 'active'
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Update course student count
      const { error: updateError } = await supabase.rpc('increment_student_count', {
        course_id: courseId
      });

      if (updateError) {
        console.warn('Failed to update student count:', updateError);
      }

      return { data: enrollment, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get seller earnings
  static async getSellerEarnings() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          amount,
          purchased_at,
          course:course_id!inner(instructor_id)
        `)
        .eq('course.instructor_id', session.session.user.id)
        .eq('status', 'completed');

      if (error) throw error;

      const totalEarnings = data?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0;
      const monthlyEarnings = this.calculateMonthlyEarnings(data || []);

      return { 
        data: { 
          total: totalEarnings, 
          monthly: monthlyEarnings,
          transactions: data 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Request payout (sellers)
  static async requestPayout(amount: number) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('request-payout', {
        body: {
          seller_id: session.session.user.id,
          amount: amount
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Helper methods
  private static calculateMonthlyEarnings(transactions: any[]) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return transactions
      .filter(transaction => {
        const purchaseDate = new Date(transaction.purchased_at);
        return purchaseDate.getMonth() === currentMonth && 
               purchaseDate.getFullYear() === currentYear;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }
}