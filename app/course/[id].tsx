
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Course } from '@/types';
import { useCourses } from '@/hooks/useCourses';

export default function CourseDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCourse, purchaseCourse } = useCourses();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const courseData = await getCourse(id);
      setCourse(courseData);
    } catch (error) {
      console.error('Error loading course:', error);
      Alert.alert('Xatolik', "Kurs ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
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
              const success = await purchaseCourse(course.id);
              if (success) {
                Alert.alert('Muvaffaqiyat!', 'Kurs muvaffaqiyatli sotib olindi!', [
                  { text: 'OK', onPress: () => loadCourse() } // Reload to update enrollment status
                ]);
              } else {
                Alert.alert('Xatolik', 'Kursni sotib olishda xatolik yuz berdi');
              }
            } finally {
              setPurchasing(false);
            }
          }
        }
      ]
    );
  };

  const handleLessonPress = (lessonId: string) => {
    if (course && (course.isEnrolled || course.lessons?.find(l => l.id === lessonId)?.is_preview)) {
      router.push(`/lesson/${course.id}/${lessonId}`);
    } else {
      Alert.alert('Kursga yoziling', "Video darslarni ko'rish uchun avval kursga yozilib oling");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Kurs yuklanmoqda...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kurs tafsilotlari</Text>
        </View>

        {/* Course Image */}
        {course.thumbnail_url && (
          <View style={styles.imageContainer}>
            <Text style={[styles.imagePlaceholder, { color: colors.text }]}>
              📚 {course.title}
            </Text>
          </View>
        )}

        {/* Course Info */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {course.title}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.instructorInfo}>
              <View style={[styles.instructorAvatar, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {course.instructor?.full_name?.[0] || 'I'}
                </Text>
              </View>
              <View>
                <Text style={[styles.instructorName, { color: colors.text }]}>
                  {course.instructor?.full_name || 'Instructor'}
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
                  {course.rating.toFixed(1)} ({course.total_reviews})
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="access-time" size={16} color={colors.text} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {formatDuration(course.duration_minutes)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="signal-cellular-alt" size={16} color={colors.text} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {course.level}
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="people" size={16} color={colors.text} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {course.total_students} talaba
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text }]}>
            {course.description || course.short_description}
          </Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>
                {course.category?.name || 'Kategoria'}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>
                {course.level}
              </Text>
            </View>
            {course.is_featured && (
              <View style={[styles.tag, { backgroundColor: '#fbbf24' }]}>
                <Text style={[styles.tagText, { color: 'white' }]}>
                  ⭐ Tavsiya
                </Text>
              </View>
            )}
          </View>

          {/* Lessons */}
          {course.lessons && course.lessons.length > 0 && (
            <View style={styles.lessonsContainer}>
              <Text style={[styles.lessonsTitle, { color: colors.text }]}>
                Darsliklar ({course.lessons.length})
              </Text>
              {course.lessons
                .sort((a, b) => a.order_index - b.order_index)
                .map((lesson, index) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonItem,
                    { backgroundColor: colors.card, borderColor: colors.border }
                  ]}
                  onPress={() => handleLessonPress(lesson.id)}
                  disabled={!course.isEnrolled && !lesson.is_preview}
                >
                  <View style={styles.lessonLeft}>
                    <View style={[styles.lessonNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.lessonNumberText}>
                        {lesson.order_index}
                      </Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={[styles.lessonTitle, { color: colors.text }]}>
                        {lesson.title}
                      </Text>
                      <Text style={[styles.lessonDuration, { color: colors.text }]}>
                        {formatDuration(lesson.duration_minutes)}
                        {lesson.is_preview && " • Bepul ko'rish"}
                      </Text>
                    </View>
                  </View>
                  {course.isEnrolled || lesson.is_preview ? (
                    <MaterialIcons name="play-circle-outline" size={20} color={colors.primary} />
                  ) : (
                    <MaterialIcons name="lock" size={20} color={colors.text} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Purchase Button */}
      {!course.isEnrolled && (
        <View style={[styles.purchaseContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={styles.priceContainer}>
            {course.original_price && course.original_price > course.price && (
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
      {course.isEnrolled && (
        <View style={[styles.enrolledContainer, { backgroundColor: '#10b981' }]}>
          <MaterialIcons name="check-circle" size={20} color="white" />
          <Text style={styles.enrolledText}>Siz ushbu kursga yozilgansiz</Text>
        </View>
      )}
    </SafeAreaView>
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
  imageContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 18,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
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
