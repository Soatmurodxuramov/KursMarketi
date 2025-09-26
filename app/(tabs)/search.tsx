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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [recentSearches] = useState([
    'React Native',
    'Flutter',
    'UI/UX Dizayn',
    'JavaScript',
    'Python'
  ]);
  const [popularCourses] = useState<Course[]>([
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
    }
  ]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filtered = popularCourses.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.category?.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filtered);
      setLoading(false);
    }, 500);
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
    if (searchQuery.trim() || searchResults.length > 0) return null;

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
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderPopularCourses = () => {
    if (searchQuery.trim() || searchResults.length > 0) return null;

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
        />
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;

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
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  recentText: {
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
  },
});