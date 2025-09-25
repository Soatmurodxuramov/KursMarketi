import { useContext, useEffect, useState, useCallback } from 'react';
import { CourseContext } from '../contexts/CourseContext';
import { useAuth } from './useAuth';
import { CourseService } from '../services/courseService';
import { Course, Category } from '../types';

// Safe hook that doesn't depend on Context for critical functions
export function useCourses() {
  // Don't use Context to avoid _currentValue2 error on iOS
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  const fetchCourses = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await CourseService.getAllCourses();
      
      if (error) {
        setError(error.message);
        return;
      }
      
      setCourses(data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchEnrolledCourses = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await CourseService.getEnrolledCourses(user.id);
      
      if (error) {
        console.error('Error fetching enrolled courses:', error);
        return;
      }
      
      setEnrolledCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching enrolled courses:', error);
    }
  }, [user]);

  const enrollInCourse = async (courseId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { data, error } = await CourseService.enrollInCourse(user.id, courseId);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Update local state
      setCourses(prev => prev.map(course =>
        course.id === courseId ? { ...course, isEnrolled: true } : course
      ));
      await fetchEnrolledCourses();
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateProgress = async (courseId: string, lessonId: string, watchTime: number) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { data, error } = await CourseService.updateLessonProgress(
        user.id,
        lessonId,
        watchTime
      );
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Calculate new progress percentage
      const courseProgress = data?.progress_percentage || 0;
      
      // Update local state
      setCourses(prev => prev.map(course =>
        course.id === courseId ? { ...course, progress: courseProgress } : course
      ));
      setEnrolledCourses(prev => prev.map(course =>
        course.id === courseId ? { ...course, progress: courseProgress } : course
      ));
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const searchCourses = async (query: string, filters: any = {}) => {
    try {
      const { data, error } = await CourseService.searchCourses(query, filters);
      
      if (error) {
        console.error('Search error:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const getCourseById = async (courseId: string) => {
    try {
      const { data, error } = await CourseService.getCourseById(courseId);
      
      if (error) {
        console.error('Get course error:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Get course error:', error);
      return null;
    }
  };

  return {
    courses,
    enrolledCourses,
    loading,
    error,
    fetchCourses,
    fetchEnrolledCourses,
    enrollInCourse,
    updateProgress,
    searchCourses,
    getCourseById,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await CourseService.getCategories();
      
      if (error) {
        setError(error.message);
        return;
      }
      
      setCategories(data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
  };
}