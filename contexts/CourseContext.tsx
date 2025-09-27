
import React, { createContext, useEffect, useState, useMemo } from 'react';
import supabase from '../services/supabase';
import { Course, Category } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CourseContextType {
  courses: Course[];
  categories: Category[];
  enrolledCourses: Course[];
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  getCourse: (id: string) => Promise<Course | null>;
  searchCourses: (query: string) => Promise<Course[]>;
  purchaseCourse: (courseId: string) => Promise<boolean>;
  clearError: () => void;
}

export const CourseContext = createContext<CourseContextType | null>(null);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    }
  };

  // Fetch courses from Supabase
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          category:categories(*),
          instructor:user_profiles(*)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCourses(data || []);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(
            *,
            category:categories(*),
            instructor:user_profiles(*)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      const coursesWithProgress = (data || []).map(enrollment => ({
        ...enrollment.course,
        progress: enrollment.progress_percentage,
        isEnrolled: true
      }));

      setEnrolledCourses(coursesWithProgress);
    } catch (err: any) {
      console.error('Error fetching enrolled courses:', err);
      setError(err.message);
    }
  };

  // Get single course
  const getCourse = async (id: string): Promise<Course | null> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          category:categories(*),
          instructor:user_profiles(*),
          lessons:lessons(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Check if user is enrolled
      if (user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .single();

        return {
          ...data,
          isEnrolled: !!enrollment,
          progress: enrollment?.progress_percentage || 0
        };
      }

      return data;
    } catch (err: any) {
      console.error('Error fetching course:', err);
      setError(err.message);
      return null;
    }
  };

  // Search courses
  const searchCourses = async (query: string): Promise<Course[]> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          category:categories(*),
          instructor:user_profiles(*)
        `)
        .eq('status', 'approved')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('rating', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error('Error searching courses:', err);
      setError(err.message);
      return [];
    }
  };

  // Purchase course (using Stripe Edge Function)
  const purchaseCourse = async (courseId: string): Promise<boolean> => {
    if (!user) {
      setError('User must be logged in to purchase courses');
      return false;
    }

    try {
      setLoading(true);

      // Call Stripe purchase Edge Function
      const { data, error } = await supabase.functions.invoke('purchaseCourse', {
        body: {
          courseId,
          userId: user.id
        }
      });

      if (error) {
        throw error;
      }

      // If purchase successful, create enrollment
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: 'active'
        });

      if (enrollmentError) {
        throw enrollmentError;
      }

      // Refresh enrolled courses
      await fetchEnrolledCourses();
      return true;
    } catch (err: any) {
      console.error('Error purchasing course:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Load initial data
  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  // Load enrolled courses when user changes
  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    } else {
      setEnrolledCourses([]);
    }
  }, [user]);

  const value = useMemo<CourseContextType>(() => ({
    courses,
    categories,
    enrolledCourses,
    loading,
    error,
    fetchCourses,
    fetchCategories,
    fetchEnrolledCourses,
    getCourse,
    searchCourses,
    purchaseCourse,
    clearError,
  }), [courses, categories, enrolledCourses, loading, error, user]);

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}
