
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import SearchBar from '@/components/SearchBar';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types';
import { useCourses } from '@/hooks/useCourses';

export default function SearchScreen() {
  const { courses, searchCourses } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches] = useState([
    'React Native',
    'Flutter',
    'UI/UX Dizayn',
    'JavaScript',
    'Python',
    'Mobile Development'
  ]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const results = await searchCourses(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Qidiruv</Text>
    </View>
  );

  const renderSearchSection = () => (
    <View style={styles.searchSection}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Kurslarni qidiring..."
      />
    </View>
  );

  const renderRecentSearches = () => {
    if (hasSearched || searchQuery.trim()) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>So'nggi qidiruvlar</Text>
        <View style={styles.recentContainer}>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => handleRecentSearchPress(search)}
            >
              <MaterialIcons name="history" size={16} color={Colors.light.tabIconDefault} />
              <Text style={styles.recentText}>{search}</Text>
              <MaterialIcons name="north-west" size={16} color={Colors.light.tabIconDefault} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderPopularCourses = () => {
    if (hasSearched || searchQuery.trim()) return null;

    const popularCourses = courses
      .sort((a, b) => b.total_students - a.total_students)
      .slice(0, 5);

    if (popularCourses.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mashhur kurslar</Text>
        <FlatList
          data={popularCourses}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => handleCoursePress(item.id)}
              style={styles.courseCard}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!hasSearched) return null;

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Qidirilmoqda...</Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search-off" size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyTitle}>Hech narsa topilmadi</Text>
          <Text style={styles.emptyText}>
            "{searchQuery}" bo'yicha kurslar topilmadi. Boshqa kalit so'zlar bilan qidirib ko'ring.
          </Text>
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => {
              setSearchQuery('');
              setHasSearched(false);
              setSearchResults([]);
            }}
          >
            <Text style={styles.clearButtonText}>Qidiruvni tozalash</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Natijalar: {searchResults.length} ta kurs topildi
        </Text>
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => handleCoursePress(item.id)}
              style={styles.courseCard}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchSection()}
      
      <View style={styles.content}>
        {renderRecentSearches()}
        {renderPopularCourses()}
        {renderSearchResults()}
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  searchSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'white',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  recentContainer: {
    gap: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  courseCard: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
