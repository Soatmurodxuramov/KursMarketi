import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCategories } from '@/hooks/useCourses';
import { Colors } from '@/constants/Colors';
import CourseCard from '@/components/CourseCard';
import CategoryCard from '@/components/CategoryCard';
import { Course } from '@/types';

// Safe auth check without Context dependency
function useSafeAuth() {
  const [authState, setAuthState] = useState({ user: null, profile: null, loading: true });
  
  useEffect(() => {
    // Simulate auth check delay
    const timer = setTimeout(() => {
      setAuthState({
        user: { id: '1', email: 'test@example.com' },
        profile: { 
          id: '1',
          username: 'test_user',
          full_name: 'Test Foydalanuvchi',
          role: 'user' as const
        },
        loading: false
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return authState;
}

export default function HomeScreen() {
  const { user, profile, loading: authLoading } = useSafeAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use standalone category hook (no Context dependency)
  const categoryHooks = useCategories();
  const categories = categoryHooks?.categories || [];

  // Load sample data when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadSampleData();
    }
  }, [user, authLoading]);

  const loadSampleData = () => {
    // Sample courses data
    const sampleCourses: Course[] = [
      {
        id: '1',
        title: 'React Native Asoslari',
        description: 'Mobile ilovalar yaratishni o\'rganish',
        short_description: 'React Native bilan mobile development',
        thumbnail_url: 'https://picsum.photos/300/200?random=1',
        price: 150000,
        original_price: 200000,
        instructor: {
          id: '1',
          username: 'instructor1',
          full_name: 'Aziz Karimov',
          avatar_url: 'https://picsum.photos/100/100?random=1'
        },
        category: {
          id: '1',
          name: 'Dasturlash',
          slug: 'programming'
        },
        level: 'Boshlang\'ich',
        duration_minutes: 1200,
        rating: 4.8,
        total_reviews: 45,
        total_students: 156,
        is_featured: true,
        status: 'approved' as const,
        lessons: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2', 
        title: 'Flutter Mobil Dasturlash',
        description: 'Cross-platform mobile ilovalar yaratish',
        short_description: 'Flutter bilan iOS va Android ilovalar',
        thumbnail_url: 'https://picsum.photos/300/200?random=2',
        price: 180000,
        instructor: {
          id: '2',
          username: 'instructor2', 
          full_name: 'Madina Usmonova',
          avatar_url: 'https://picsum.photos/100/100?random=2'
        },
        category: {
          id: '1',
          name: 'Dasturlash',
          slug: 'programming'
        },
        level: 'O\'rta',
        duration_minutes: 1800,
        rating: 4.9,
        total_reviews: 67,
        total_students: 234,
        is_featured: true,
        status: 'approved' as const,
        lessons: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    setCourses(sampleCourses);
    
    // Sample enrolled courses
    if (profile?.role !== 'seller') {
      setEnrolledCourses([{
        ...sampleCourses[0],
        progress: 65,
        isEnrolled: true
      }]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user && !authLoading) {
      loadSampleData();
    }
    setRefreshing(false);
  };

  const handleCoursePress = (courseId: string) => {
    console.log('Navigate to course:', courseId);
    // router.push(`/course/${courseId}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    console.log('Navigate to category:', categoryId);
    // Apply category filter and navigate to courses tab
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeTitle}>
        Salom, {profile?.full_name || profile?.username || 'Foydalanuvchi'}! 👋
      </Text>
      <Text style={styles.welcomeSubtitle}>
        Bugun qanday yangi narsalarni o'rganmoqchisiz?
      </Text>
    </View>
  );

  const renderCategoriesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategoriyalar</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Barchasini ko'rish</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={() => handleCategoryPress(category.id)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderEnrolledCoursesSection = () => {
    if (enrolledCourses.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Davom etayotgan kurslar</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Barchasini ko'rish</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.coursesScroll}
          contentContainerStyle={styles.coursesContainer}
        >
          {enrolledCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPress={() => handleCoursePress(course.id)}
              style={styles.horizontalCourseCard}
              showProgress={true}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderFeaturedCoursesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tavsiya etiladigan kurslar</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Barchasini ko'rish</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.coursesScroll}
        contentContainerStyle={styles.coursesContainer}
      >
        {courses.slice(0, 5).map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onPress={() => handleCoursePress(course.id)}
            style={styles.horizontalCourseCard}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderStatsSection = () => {
    if (!profile || profile.role === 'user') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {profile.role === 'seller' ? 'Sizning statistikangiz' : 'Tizim statistikasi'}
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="school" size={24} color={Colors.light.tint} />
            <Text style={styles.statNumber}>
              {profile.role === 'seller' ? '3' : courses.length}
            </Text>
            <Text style={styles.statLabel}>Kurslar</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="people" size={24} color={Colors.light.tint} />
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Talabalar</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="star" size={24} color={Colors.light.tint} />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Reyting</Text>
          </View>
          
          {profile.role === 'seller' && (
            <View style={styles.statCard}>
              <MaterialIcons name="attach-money" size={24} color={Colors.light.tint} />
              <Text style={styles.statNumber}>2.5M</Text>
              <Text style={styles.statLabel}>Daromad</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Show loading during initial auth check
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Tizimga kiring...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderWelcomeSection()}
        {renderStatsSection()}
        {renderCategoriesSection()}
        {renderEnrolledCoursesSection()}
        {renderFeaturedCoursesSection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  categoriesScroll: {
    marginHorizontal: -20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  coursesScroll: {
    marginHorizontal: -20,
  },
  coursesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  horizontalCourseCard: {
    width: 280,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
});