
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
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types';
import { useCourses } from '@/hooks/useCourses';

export default function CoursesScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const { 
    courses, 
    categories, 
    loading, 
    error, 
    fetchCourses, 
    clearError 
  } = useCourses();
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    if (error) {
      console.error('Course error:', error);
      clearError();
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category?.id === selectedCategory);

  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const renderCategoryFilter = () => {
    const allCategories = [
      { id: 'all', name: 'Barchasi', slug: 'all' },
      ...categories
    ];

    return (
      <View style={styles.categoryFilter}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {allCategories.map((category) => (
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
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <CourseCard
      course={item}
      onPress={() => handleCoursePress(item.id)}
      style={styles.courseCard}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="school" size={64} color={Colors.light.tabIconDefault} />
      <Text style={styles.emptyTitle}>Kurslar topilmadi</Text>
      <Text style={styles.emptySubtitle}>
        {selectedCategory === 'all' 
          ? 'Hozircha tasdiqlangan kurslar mavjud emas'
          : 'Ushbu kategoriyada kurslar mavjud emas'
        }
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Yangilash</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && courses.length === 0) {
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
      
      <View style={styles.statsHeader}>
        <Text style={styles.statsText}>
          {filteredCourses.length} ta kurs mavjud
          {selectedCategory !== 'all' && (
            <Text style={styles.categoryName}>
              {' • ' + categories.find(c => c.id === selectedCategory)?.name}
            </Text>
          )}
        </Text>
      </View>
      
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        style={styles.coursesList}
        contentContainerStyle={[
          styles.coursesContainer,
          filteredCourses.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        numColumns={1}
        ListEmptyComponent={renderEmptyState}
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
  statsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  statsText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  categoryName: {
    fontWeight: '600',
    color: Colors.light.tint,
  },
  coursesList: {
    flex: 1,
  },
  coursesContainer: {
    padding: 16,
    gap: 16,
  },
  emptyListContainer: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
