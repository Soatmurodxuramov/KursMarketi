
import { useContext } from 'react';
import { CourseContext } from '../contexts/CourseContext';

export function useCourses() {
  const context = useContext(CourseContext);
  
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  
  return context;
}

// Standalone categories hook for components that only need categories
export function useCategories() {
  const { categories, loading, error, fetchCategories } = useCourses();
  
  return {
    categories,
    loading,
    error,
    fetchCategories
  };
}
