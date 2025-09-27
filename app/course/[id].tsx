import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Course } from '../../types';

export default function CourseDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    if (typeof id === 'string') {
      try {
        // Sample course data with proper structure
        const sampleCourse: Course = {
          id: id,
          title: 'React Native Asoslari',
          description: `Bu kurs React Native texnologiyasi orqali mobile ilovalar yaratish bo'yicha to'liq ma'lumot beradi. 

Kurs davomida quyidagi mavzularni o'rganasiz:
• React Native asoslari
• Navigation va routing  
• State management
• API integration
• Performance optimization
• Testing va debugging

Kurs oxirida siz professional darajada mobile ilovalar yarata olasiz.`,
          short_description: 'React Native bilan mobile development',
          thumbnail_url: 'https://picsum.photos/400/300?random=1',
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
          lessons: [
            {
              id: '1',
              course_id: id,
              title: 'Kirish va React Native o\'rnatish',
              description: 'React Native muhitini o\'rnatish va birinchi loyiha yaratish',
              video_url: 'https://example.com/video1.mp4',
              duration_minutes: 45,
              order_index: 1,
              is_preview: true,
              resources_urls: [],
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              course_id: id,
              title: 'Komponentlar va JSX',
              description: 'React Native komponentlari va JSX sintaksisi',
              video_url: 'https://example.com/video2.mp4',
              duration_minutes: 60,
              order_index: 2,
              is_preview: false,
              resources_urls: [],
              created_at: new Date().toISOString()
            },
            {
              id: '3',
              course_id: id,
              title: 'State va Props',
              description: 'Ma\'lumotlarni boshqarish va komponentlar orasida uzatish',
              video_url: 'https://example.com/video3.mp4',
              duration_minutes: 55,
              order_index: 3,
              is_preview: false,
              resources_urls: [],
              created_at: new Date().toISOString()
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setCourse(sampleCourse);
        // Check if user is enrolled (simulate for demo)
        setIsEnrolled(Math.random() > 0.5);
      } catch (error) {
        console.error('Error loading course:', error);
        Alert.alert('Xatolik', 'Kurs ma\'lumotlarini yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePurchase = async () => {
    if (!course || purchasing) return;

    Alert.alert(
      'Kursni sotib olish',
      `${course.title} kursini ${formatPrice(course.price)} ga sotib olmoqchimisiz?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Sotib olish',
          onPress: async () => {
            setPurchasing(true);
            try {
              // Simulate purchase
              setTimeout(() => {
                setIsEnrolled(true);
                setPurchasing(false);
                Alert.alert('Muvaffaqiyat!', 'Kurs muvaffaqiyatli sotib olindi!');
              }, 2000);
            } catch (error) {
              setPurchasing(false);
              Alert.alert('Xatolik', 'Kursni sotib olishda xatolik yuz berdi');
            }
          }
        }
      ]
    );
  };

  const handleLessonPress = (lessonId: string) => {
    if (course && isEnrolled) {
      router.push(`/lesson/${course.id}/${lessonId}`);
    } else {
      Alert.alert('Kursga yoziling', 'Video darslarni ko\'rish uchun avval kursga yozilib oling');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Kurs yuklanmoqda...
        </Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error" size={64} color={colors.text} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Kurs topilmadi
        </Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Orqaga</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kurs tafsilotlari</Text>
        </View>

        {/* Course Image */}
        <Image
          source={{ uri: course.thumbnail_url }}
          style={styles.thumbnail}
          contentFit="cover"
        />

        {/* Course Info */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {course.title}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.instructorInfo}>
              <Image
                source={{ uri: course.instructor.avatar_url }}
                style={styles.instructorAvatar}
                contentFit="cover"
              />
              <View>
                <Text style={[styles.instructorName, { color: colors.text }]}>
                  {course.instructor.full_name}
                </Text>
                <Text style={[styles.instructorBio, { color: colors.text }]}>
                  Tajribali o'qituvchi
                </Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="star" size={16} color="#fbbf24" />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {course.rating} ({course.total_reviews})
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="access-time" size={16} color={colors.text} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {Math.round(course.duration_minutes / 60)}h {course.duration_minutes % 60}m
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="signal-cellular-alt" size={16} color={colors.text} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {course.level}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text }]}>
            {course.description}
          </Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>
                {course.category.name}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>
                {course.level}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>
                Mobile Development
              </Text>
            </View>
          </View>

          {/* Lessons */}
          <View style={styles.lessonsContainer}>
            <Text style={[styles.lessonsTitle, { color: colors.text }]}>
              Darsliklar ({course.lessons.length})
            </Text>
            {course.lessons.map((lesson, index) => (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonItem,
                  { backgroundColor: colors.card, borderColor: colors.border }
                ]}
                onPress={() => handleLessonPress(lesson.id)}
                disabled={!isEnrolled && !lesson.is_preview}
              >
                <View style={styles.lessonLeft}>
                  <View style={[styles.lessonNumber, { backgroundColor: colors.primary }]}>
                    <Text style={styles.lessonNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, { color: colors.text }]}>
                      {lesson.title}
                    </Text>
                    <Text style={[styles.lessonDuration, { color: colors.text }]}>
                      {lesson.duration_minutes} daqiqa
                    </Text>
                  </View>
                </View>
                {isEnrolled || lesson.is_preview ? (
                  <MaterialIcons name="play-circle-outline" size={20} color={colors.primary} />
                ) : (
                  <MaterialIcons name="lock" size={20} color={colors.text} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      {!isEnrolled && (
        <View style={[styles.purchaseContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={styles.priceContainer}>
            {course.original_price && (
              <Text style={[styles.originalPrice, { color: colors.text }]}>
                {formatPrice(course.original_price)}
              </Text>
            )}
            <Text style={[styles.currentPrice, { color: colors.primary }]}>
              {formatPrice(course.price)}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              { backgroundColor: purchasing ? colors.secondary : colors.primary }
            ]}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.purchaseButtonText}>
                Sotib olish
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Enrolled Badge */}
      {isEnrolled && (
        <View style={[styles.enrolledContainer, { backgroundColor: '#10b981' }]}>
          <MaterialIcons name="check-circle" size={20} color="white" />
          <Text style={styles.enrolledText}>Siz ushbu kursga yozilgansiz</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  thumbnail: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 32,
  },
  metaContainer: {
    marginBottom: 20,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructorBio: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lessonsContainer: {
    marginBottom: 100,
  },
  lessonsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  lessonDuration: {
    fontSize: 14,
    opacity: 0.7,
  },
  purchaseContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  purchaseButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enrolledContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  enrolledText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});