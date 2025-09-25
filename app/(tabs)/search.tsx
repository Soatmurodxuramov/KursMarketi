import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  FlatList,
  Text,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useCourses } from '../../hooks/useCourses';
import { CourseCard } from '../../components/CourseCard';
import { SearchBar } from '../../components/SearchBar';
import { Course } from '../../types';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { category } = useLocalSearchParams();
  const { courses, searchCourses, loading } = useCourses();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (category && typeof category === 'string') {
      const filteredCourses = courses.filter(course => course.category === category);
      setSearchResults(filteredCourses);
      setSearchQuery(category);
    } else {
      setSearchResults(courses);
    }
  }, [courses, category]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults(courses);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchCourses(query);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <CourseCard
      course={item}
      onPress={() => handleCoursePress(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        {searchQuery ? 'Hech qanday kurs topilmadi' : 'Qidirishni boshlang...'}
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.text }]}>
        {searchQuery 
          ? 'Boshqa kalit so\'zlar bilan urinib ko\'ring' 
          : 'Yuqoridagi qidiruv maydonidan foydalaning'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Qidiruv
        </Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        onSubmit={() => handleSearch(searchQuery)}
      />

      {/* Results Count */}
      {searchResults.length > 0 && (
        <Text style={[styles.resultCount, { color: colors.text }]}>
          {searchResults.length} ta kurs topildi
        </Text>
      )}

      {/* Loading Indicator for Search */}
      {isSearching && (
        <View style={styles.searchLoadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.searchLoadingText, { color: colors.text }]}>
            Qidirilmoqda...
          </Text>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={searchResults}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={!isSearching ? renderEmptyState : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  resultCount: {
    paddingHorizontal: 16,
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  searchLoadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
});