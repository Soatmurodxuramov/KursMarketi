import supabase from './supabase';
import { Course, Category, Instructor, CourseStatus } from '../types';

export interface CreateCourseData {
  title: string;
  description: string;
  short_description?: string;
  category_id: string;
  price: number;
  original_price?: number;
  level: string;
  requirements?: string;
  what_you_learn: string[];
  tags: string[];
}

export interface CreateLessonData {
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_preview?: boolean;
}

export class CourseService {
  // Get all approved courses
  static async getAllCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:instructor_id(id, username, full_name, avatar_url, role),
          category:category_id(id, name, slug)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: this.transformCourses(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get course by ID with lessons
  static async getCourse(courseId: string) {
    try {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:instructor_id(id, username, full_name, avatar_url, role),
          category:category_id(id, name, slug),
          lessons(*)
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Check if user is enrolled
      const { data: session } = await supabase.auth.getSession();
      let enrollment = null;
      
      if (session?.session?.user) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('course_id', courseId)
          .single();
        
        enrollment = enrollmentData;
      }

      return { 
        data: this.transformCourse(course, enrollment), 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get categories
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get enrolled courses for current user
  static async getEnrolledCourses() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:course_id(
            *,
            instructor:instructor_id(id, username, full_name, avatar_url),
            category:category_id(id, name, slug)
          )
        `)
        .eq('user_id', session.session.user.id)
        .eq('status', 'active');

      if (error) throw error;

      const courses = data?.map(enrollment => ({
        ...this.transformCourse(enrollment.course),
        isEnrolled: true,
        progress: enrollment.progress_percentage || 0,
        enrolledAt: enrollment.enrolled_at
      })) || [];

      return { data: courses, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Search courses
  static async searchCourses(query: string, categoryId?: string) {
    try {
      let queryBuilder = supabase
        .from('courses')
        .select(`
          *,
          instructor:instructor_id(id, username, full_name, avatar_url),
          category:category_id(id, name, slug)
        `)
        .eq('status', 'approved');

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
      }

      if (categoryId) {
        queryBuilder = queryBuilder.eq('category_id', categoryId);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      return { data: this.transformCourses(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Create course (sellers only)
  static async createCourse(courseData: CreateCourseData) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Authentication required');
      }

      const slug = this.generateSlug(courseData.title);

      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          slug,
          instructor_id: session.session.user.id,
          status: 'draft' as CourseStatus,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update course
  static async updateCourse(courseId: string, updates: Partial<CreateCourseData>) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Create lesson
  static async createLesson(lessonData: CreateLessonData) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert(lessonData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Upload course thumbnail
  static async uploadThumbnail(courseId: string, imageUri: string) {
    try {
      const fileName = `thumbnails/${courseId}/${Date.now()}.jpg`;
      
      // Convert image to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('course-materials')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(fileName);

      // Update course with thumbnail URL
      await this.updateCourse(courseId, { thumbnail_url: publicUrl });

      return { data: publicUrl, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get courses by instructor
  static async getCoursesByInstructor(instructorId: string) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          category:category_id(id, name, slug),
          lessons(id)
        `)
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Submit course for approval
  static async submitForApproval(courseId: string) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ 
          status: 'pending' as CourseStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Add to wishlist
  static async addToWishlist(courseId: string) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: session.session.user.id,
          course_id: courseId
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Remove from wishlist
  static async removeFromWishlist(courseId: string) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', session.session.user.id)
        .eq('course_id', courseId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get wishlist
  static async getWishlist() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          course:course_id(
            *,
            instructor:instructor_id(id, username, full_name, avatar_url),
            category:category_id(id, name, slug)
          )
        `)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      const courses = data?.map(wishlist => 
        this.transformCourse(wishlist.course)
      ) || [];

      return { data: courses, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Helper methods
  private static transformCourses(courses: any[]): Course[] {
    return courses?.map(course => this.transformCourse(course)) || [];
  }

  private static transformCourse(course: any, enrollment?: any): Course {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: {
        id: course.instructor?.id || course.instructor_id,
        name: course.instructor?.full_name || course.instructor?.username || 'Unknown',
        avatar: course.instructor?.avatar_url || 'https://via.placeholder.com/150',
        bio: course.instructor?.bio || '',
        rating: 4.5, // Default rating
        courseCount: 1,
        studentCount: course.total_students || 0,
        expertise: course.tags || []
      },
      price: course.price,
      originalPrice: course.original_price,
      rating: course.rating || 0,
      reviewCount: course.total_reviews || 0,
      duration: `${course.duration_minutes || 0} minutes`,
      level: course.level || 'Beginner',
      category: course.category?.name || 'General',
      thumbnail: course.thumbnail_url || 'https://via.placeholder.com/300x200',
      isEnrolled: !!enrollment,
      progress: enrollment?.progress_percentage || 0,
      tags: course.tags || [],
      lessons: course.lessons?.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        duration: `${lesson.duration_minutes || 0} minutes`,
        videoUrl: lesson.video_url || '',
        isWatched: false,
        description: lesson.description || ''
      })) || []
    };
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
}