import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { courseService } from '../../../services/courseService';
import { useCourses } from '../../../hooks/useCourses';
import { Course, Lesson } from '../../../types';

const { width } = Dimensions.get('window');

export default function LessonScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { courseId, lessonId } = useLocalSearchParams();
  const { updateProgress } = useCourses();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [courseId, lessonId]);

  const loadData = async () => {
    if (typeof courseId === 'string' && typeof lessonId === 'string') {
      try {
        const courseData = await courseService.getCourse(courseId);
        if (courseData) {
          const lessonData = courseData.lessons.find(l => l.id === lessonId);
          setCourse(courseData);
          setLesson(lessonData || null);
        }
      } catch (error) {
        Alert.alert('Xatolik', 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
  };

  const handleMarkAsWatched = async () => {
    if (course && lesson && typeof courseId === 'string') {
      try {
        await updateProgress(courseId, lesson.id);
        setLesson({ ...lesson, isWatched: true });
        Alert.alert('Ajoyib!', 'Dars muvaffaqiyatli tugallandi!');
      } catch (error) {
        Alert.alert('Xatolik', 'Progressni saqlashda xatolik yuz berdi');
      }
    }
  };

  const handleNextLesson = () => {
    if (course && lesson) {
      const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
      const nextLesson = course.lessons[currentIndex + 1];
      
      if (nextLesson) {
        router.replace(`/lesson/${course.id}/${nextLesson.id}`);
      } else {
        Alert.alert('Tabriklaymiz!', 'Siz barcha darslarni tugalladingiz!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!course || !lesson) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Dars topilmadi
        </Text>
      </View>
    );
  }

  const currentLessonIndex = course.lessons.findIndex(l => l.id === lesson.id);
  const isLastLesson = currentLessonIndex === course.lessons.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Video Player Placeholder */}
      <View style={[styles.videoContainer, { backgroundColor: colors.card }]}>
        {videoLoading && (
          <View style={styles.videoLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.videoLoadingText, { color: colors.text }]}>
              Video yuklanmoqda...
            </Text>
          </View>
        )}
        
        {/* Placeholder for video player */}
        <View style={[styles.videoPlaceholder, { backgroundColor: colors.secondary }]}>
          <MaterialIcons
            name="play-circle-outline"
            size={80}
            color={colors.primary}
            onPress={handleVideoLoad}
          />
          <Text style={[styles.videoPlaceholderText, { color: colors.text }]}>
            Video player
          </Text>
          <Text style={[styles.videoNote, { color: colors.text }]}>
            Haqiqiy ilovada bu yerda video ko'rsatiladi
          </Text>
        </View>
      </View>

      {/* Lesson Info */}
      <View style={styles.content}>
        <Text style={[styles.courseTitle, { color: colors.text }]}>
          {course.title}
        </Text>
        
        <Text style={[styles.lessonTitle, { color: colors.text }]}>
          {lesson.title}
        </Text>

        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="access-time" size={16} color={colors.text} />
            <Text style={[styles.metaText, { color: colors.text }]}>
              {lesson.duration}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="playlist-play" size={16} color={colors.text} />
            <Text style={[styles.metaText, { color: colors.text }]}>
              {currentLessonIndex + 1} / {course.lessons.length}
            </Text>
          </View>
        </View>

        {lesson.description && (
          <Text style={[styles.description, { color: colors.text }]}>
            {lesson.description}
          </Text>
        )}

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentLessonIndex + 1) / course.lessons.length) * 100}%`,
                  backgroundColor: colors.primary
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {Math.round(((currentLessonIndex + 1) / course.lessons.length) * 100)}% tugallangan
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!lesson.isWatched && (
            <TouchableOpacity
              style={[styles.button, styles.markButton, { backgroundColor: colors.success }]}
              onPress={handleMarkAsWatched}
            >
              <MaterialIcons name="check" size={20} color="white" />
              <Text style={styles.buttonText}>
                Tugallandi deb belgilash
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.nextButton,
              { backgroundColor: isLastLesson ? colors.accent : colors.primary }
            ]}
            onPress={handleNextLesson}
          >
            <Text style={styles.buttonText}>
              {isLastLesson ? 'Kursni yakunlash' : 'Keyingi dars'}
            </Text>
            <MaterialIcons 
              name={isLastLesson ? 'celebration' : 'arrow-forward'} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
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
  videoContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  videoLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  videoLoadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  videoNote: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  courseTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 28,
  },
  lessonMeta: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 14,
    opacity: 0.7,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  markButton: {
    backgroundColor: '#22c55e',
  },
  nextButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});