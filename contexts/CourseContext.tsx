import React, { createContext, useReducer, ReactNode, useMemo } from 'react';
import { Course } from '../types';

interface CourseState {
  courses: Course[];
  enrolledCourses: Course[];
  loading: boolean;
  error: string | null;
}

type CourseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_ENROLLED_COURSES'; payload: Course[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'ENROLL_COURSE'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: { courseId: string; progress: number } };

interface CourseContextType {
  state: CourseState;
  dispatch: React.Dispatch<CourseAction>;
}

const initialState: CourseState = {
  courses: [],
  enrolledCourses: [],
  loading: false,
  error: null,
};

const courseReducer = (state: CourseState, action: CourseAction): CourseState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_COURSES':
      return { ...state, courses: action.payload, loading: false };
    case 'SET_ENROLLED_COURSES':
      return { ...state, enrolledCourses: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.id ? action.payload : course
        ),
        enrolledCourses: state.enrolledCourses.map(course =>
          course.id === action.payload.id ? action.payload : course
        ),
      };
    case 'ENROLL_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload ? { ...course, isEnrolled: true, progress: 0 } : course
        ),
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.courseId
            ? { ...course, progress: action.payload.progress }
            : course
        ),
        enrolledCourses: state.enrolledCourses.map(course =>
          course.id === action.payload.courseId
            ? { ...course, progress: action.payload.progress }
            : course
        ),
      };
    default:
      return state;
  }
};

// Create context with default value that matches interface
export const CourseContext = createContext<CourseContextType | null>(null);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    dispatch,
  }), [state]);

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
};