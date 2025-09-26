import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import CourseCard from '@/components/CourseCard';
import { Course, Category } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function CoursesScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load sample data
      const sampleCategories: Category[] = [
        { id: 'all', name: 'Barchasi', slug: 'all' },
        { id: '1', name: 'Dasturlash', slug: 'programming' },
        { id: '2', name: 'Dizayn', slug: 'design' },
        { id: '3', name: 'Marketing', slug: 'marketing' },
        { id: '4', name: 'Biznes', slug: 'business' },
      ];

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
          is_featured: false,
          status: 'approved' as const,
          lessons: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'UI/UX Dizayn Asoslari',
          description: 'Foydalanuvchi interfeysi va tajribasi dizayni',
          short_description: 'Zamonaviy UI/UX dizayn printsiplari',
          thumbnail_url: 'https://picsum.photos/300/200?random=3',
          price: 120000,
          instructor: {
            id: '3',
            username: 'instructor3',
            full_name: 'Jasur Toshev',
            avatar_url: 'https://picsum.photos/100/100?random=3'
          },
          category: {
            id: '2',
            name: 'Dizayn',
            slug: 'design'
          },
          level: 'Boshlang\'ich',
          duration_minutes: 900,
          rating: 4.7,
          total_reviews: 89,
          total_students: 298,
          is_featured: true,
          status: 'approved' as const,
          lessons: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Digital Marketing Strategiyalari',
          description: 'Raqamli marketing va SMM',
          short_description: 'Online biznesni rivojlantirish usullari',
          thumbnail_url: 'https://picsum.photos/300/200?random=4',
          price: 100000,
          instructor: {
            id: '4',
            username: 'instructor4',
            full_name: 'Nilufar Rahimova',
            avatar_url: 'https://picsum.photos/100/100?random=4'
          },
          category: {
            id: '3',
            name: 'Marketing',
            slug: 'marketing'
          },
          level: 'O\'rta',
          duration_minutes: 1500,
          rating: 4.6,
          total_reviews: 134,
          total_students: 567,
          is_featured: false,
          status: 'approved' as const,
          lessons: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          title: 'Startup Yaratish',
          description: 'Noldan biznes qurish va rivojlantirish',
          short_description: 'Muvaffaqiyatli startup yaratish sirlari',
          thumbnail_url: 'https://picsum.photos/300/200?random=5',
          price: 250000,
          instructor: {
            id: '5',
            username: 'instructor5',
            full_name: 'Botir Aliyev',
            avatar_url: 'https://picsum.photos/100/100?random=5'
          },
          category: {
            id: '4',
            name: 'Biznes',
            slug: 'business'
          },
          level: 'Yuqori',
          duration_minutes: 2400,
          rating: 4.9,
          total_reviews: 78,
          total_students: 145,
          is_featured: true,
          status: 'approved' as const,
          lessons: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setCategories(sampleCategories);
      setCourses(sampleCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category?.id === selectedCategory);

  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.selectedCategoryButtonText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCourseItem = ({ item }: { item: Course }) => (
    <CourseCard
      course={item}
      onPress={() => handleCoursePress(item.id)}
      style={styles.courseCard}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Kurslar yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kurslar</Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <MaterialIcons name="search" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
      
      {renderCategoryFilter()}
      
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        style={styles.coursesList}
        contentContainerStyle={styles.coursesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        numColumns={1}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  categoryFilter: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryContainer: {
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  coursesList: {
    flex: 1,
  },
  coursesContainer: {
    padding: 16,
    gap: 16,
  },
  courseCard: {
    marginBottom: 0,
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