export type CourseStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type EnrollmentStatus = 'active' | 'completed' | 'refunded';
export type UserRole = 'admin' | 'seller' | 'user';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: Instructor;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  duration: string;
  level: string;
  category: string;
  thumbnail: string;
  isEnrolled?: boolean;
  progress?: number;
  tags: string[];
  lessons: Lesson[];
  status?: CourseStatus;
  enrolledAt?: string;
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  courseCount: number;
  studentCount: number;
  expertise: string[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isWatched: boolean;
  description?: string;
  isPreview?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  is_approved: boolean;
  bio?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  course_id: string;
  amount: number;
  status: string;
  purchased_at: string;
  course?: Course;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
}

export interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: UserProfile;
}

export interface SellerStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  pendingPayouts: number;
}