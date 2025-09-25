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
import { courseService } from '../../services/courseService';
import { useCourses } from '../../hooks/useCourses';
import { Course } from '../../types';

export default function CourseDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams();
  const { purchaseCourse } = useCourses();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    if (typeof id === 'string') {
      try {
        const courseData = await courseService.getCourse(id);
        setCourse(courseData);
      } catch (error) {
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
              const success = await purchaseCourse(course.id);
              if (success) {
                Alert.alert('Muvaffaqiyat!', 'Kurs muvaffaqiyatli sotib olindi!', [
                  { text: 'OK', onPress: () => router.back() }
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
    if (course && course.isEnrolled) {
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
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Kurs topilmadi
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Course Image */}
        <Image
          source={{ uri: course.thumbnail }}
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
                source={{ uri: course.instructor.avatar }}
                style={styles.instructorAvatar}
                contentFit="cover"
              />
              <View>
                <Text style={[styles.instructorName, { color: colors.text }]}>
                  {course.instructor.name}
                </Text>
                <Text style={[styles.instructorBio, { color: colors.text }]}>
                  {course.instructor.bio}
                </Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="star" size={16} color="#fbbf24" />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {course.rating} ({course.reviewCount})
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="access-time" size={16} color={colors.text} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {course.duration}
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
            {course.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagText, { color: colors.text }]}>
                  {tag}
                </Text>
              </View>
            ))}
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
                disabled={!course.isEnrolled}
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
                      {lesson.duration}
                    </Text>
                  </View>
                </View>
                {course.isEnrolled ? (
                  lesson.isWatched ? (
                    <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  ) : (
                    <MaterialIcons name="play-circle-outline" size={20} color={colors.primary} />
                  )
                ) : (
                  <MaterialIcons name="lock" size={20} color={colors.text} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      {!course.isEnrolled && (
        <View style={[styles.purchaseContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={styles.priceContainer}>
            {course.originalPrice && (
              <Text style={[styles.originalPrice, { color: colors.text }]}>
                {formatPrice(course.originalPrice)}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
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
});