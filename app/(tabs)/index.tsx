
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
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { Colors } from '@/constants/Colors';
import CourseCard from '@/components/CourseCard';
import CategoryCard from '@/components/CategoryCard';

export default function HomeScreen() {
  const { user, profile, loading: authLoading } = useAuth();
  const { 
    courses, 
    categories, 
    enrolledCourses, 
    loading, 
    error,
    fetchCourses,
    fetchCategories,
    clearError 
  } = useCourses();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (error) {
      console.error('Course error:', error);
      clearError();
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCourses(),
        fetchCategories()
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/courses',
      params: { categoryId }
    });
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

  const renderCategoriesSection = () => {
    if (categories.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategoriyalar</Text>
          <TouchableOpacity onPress={() => router.push('/courses')}>
            <Text style={styles.seeAllText}>Barchasini ko'rish</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.slice(0, 10).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={() => handleCategoryPress(category.id)}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

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

  const renderFeaturedCoursesSection = () => {
    const featuredCourses = courses.filter(course => course.is_featured);
    
    if (featuredCourses.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tavsiya etiladigan kurslar</Text>
          <TouchableOpacity onPress={() => router.push('/courses')}>
            <Text style={styles.seeAllText}>Barchasini ko'rish</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.coursesScroll}
          contentContainerStyle={styles.coursesContainer}
        >
          {featuredCourses.slice(0, 10).map((course) => (
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
  };

  const renderPopularCoursesSection = () => {
    const popularCourses = courses
      .sort((a, b) => b.total_students - a.total_students)
      .slice(0, 10);

    if (popularCourses.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mashhur kurslar</Text>
          <TouchableOpacity onPress={() => router.push('/courses')}>
            <Text style={styles.seeAllText}>Barchasini ko'rish</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.coursesScroll}
          contentContainerStyle={styles.coursesContainer}
        >
          {popularCourses.map((course) => (
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
  };

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
              {profile.role === 'seller' 
                ? courses.filter(c => c.instructor.id === user?.id).length 
                : courses.length
              }
            </Text>
            <Text style={styles.statLabel}>Kurslar</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="people" size={24} color={Colors.light.tint} />
            <Text style={styles.statNumber}>
              {courses.reduce((total, course) => total + course.total_students, 0)}
            </Text>
            <Text style={styles.statLabel}>Talabalar</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="star" size={24} color={Colors.light.tint} />
            <Text style={styles.statNumber}>
              {courses.length > 0 
                ? (courses.reduce((total, course) => total + course.rating, 0) / courses.length).toFixed(1)
                : '0'
              }
            </Text>
            <Text style={styles.statLabel}>Reyting</Text>
          </View>
          
          {profile.role === 'admin' && (
            <View style={styles.statCard}>
              <MaterialIcons name="category" size={24} color={Colors.light.tint} />
              <Text style={styles.statNumber}>{categories.length}</Text>
              <Text style={styles.statLabel}>Kategoriyalar</Text>
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
        {renderPopularCoursesSection()}
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
