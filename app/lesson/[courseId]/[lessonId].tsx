import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '@/constants/Colors';
import supabase from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
  resources_urls: string[];
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

const { width: screenWidth } = Dimensions.get('window');

export default function LessonScreen() {
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const videoRef = useRef<Video>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (courseId && lessonId) {
      loadCourseAndLesson();
    }
  }, [courseId, lessonId]);

  const loadCourseAndLesson = async () => {
    if (!courseId || !lessonId) return;

    try {
      setLoading(true);

      // Load course with lessons
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(*)
        `)
        .eq('id', courseId)
        .single();

      if (courseError) {
        throw courseError;
      }

      setCourse(courseData);

      // Find current lesson
      const lesson = courseData.lessons.find((l: Lesson) => l.id === lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }
      
      setCurrentLesson(lesson);

      // Check access - user must be enrolled or lesson is preview
      if (user) {
        if (lesson.is_preview) {
          setHasAccess(true);
        } else {
          const { data: enrollment } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .eq('status', 'active')
            .single();

          setHasAccess(!!enrollment);
        }
      } else {
        setHasAccess(lesson.is_preview);
      }

    } catch (error: any) {
      console.error('Error loading lesson:', error);
      Alert.alert('Xatolik', 'Dars ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const markLessonProgress = async () => {
    if (!user || !courseId || !lessonId || !hasAccess) return;

    try {
      // Mark lesson as completed
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error marking progress:', error);
      }
    } catch (error) {
      console.error('Error marking lesson progress:', error);
    }
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setVideoLoading(false);
      setIsPlaying(status.isPlaying);
      
      if (status.durationMillis) {
        setProgress((status.positionMillis / status.durationMillis) * 100);
      }
      
      // Mark progress when 80% completed
      if (status.positionMillis / status.durationMillis >= 0.8) {
        markLessonProgress();
      }
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
    }
  };

  const navigateToLesson = (lesson: Lesson) => {
    if (lesson.is_preview || hasAccess) {
      router.push(`/lesson/${courseId}/${lesson.id}`);
    } else {
      Alert.alert('Kursga yoziling', 'Bu darsni ko\'rish uchun kursga yozilib oling');
    }
  };

  const getNextLesson = (): Lesson | null => {
    if (!course || !currentLesson) return null;
    
    const sortedLessons = course.lessons.sort((a, b) => a.order_index - b.order_index);
    const currentIndex = sortedLessons.findIndex(l => l.id === currentLesson.id);
    
    return currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;
  };

  const getPrevLesson = (): Lesson | null => {
    if (!course || !currentLesson) return null;
    
    const sortedLessons = course.lessons.sort((a, b) => a.order_index - b.order_index);
    const currentIndex = sortedLessons.findIndex(l => l.id === currentLesson.id);
    
    return currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Dars yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccessContainer}>
          <MaterialIcons name="lock" size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.noAccessTitle}>Dostup yo'q</Text>
          <Text style={styles.noAccessText}>
            Bu darsni ko'rish uchun kursga yozilib oling yoki bu bepul dars emas.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Orqaga</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentLesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.errorTitle}>Dars topilmadi</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Orqaga</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentLesson.title}
        </Text>
        <TouchableOpacity style={styles.menuBtn}>
          <MaterialIcons name="more-vert" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        {currentLesson.video_url ? (
          <Video
            ref={videoRef}
            source={{ uri: currentLesson.video_url }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        ) : (
          <View style={styles.noVideoContainer}>
            <MaterialIcons name="play-disabled" size={64} color={Colors.light.tabIconDefault} />
            <Text style={styles.noVideoText}>Video mavjud emas</Text>
          </View>
        )}
        
        {videoLoading && (
          <View style={styles.videoLoadingOverlay}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
        
        {/* Video Controls */}
        {currentLesson.video_url && (
          <View style={styles.videoControls}>
            <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
              <MaterialIcons 
                name={isPlaying ? "pause" : "play-arrow"} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progress}%` }]} 
            />
          </View>
        </View>
      </View>

      {/* Lesson Info */}
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
        <Text style={styles.lessonDuration}>
          {currentLesson.duration_minutes} daqiqa
          {currentLesson.is_preview && ' • Bepul ko\'rish'}
        </Text>
        {currentLesson.description && (
          <Text style={styles.lessonDescription}>
            {currentLesson.description}
          </Text>
        )}
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        {getPrevLesson() && (
          <TouchableOpacity 
            style={[styles.navButton, styles.prevButton]}
            onPress={() => {
              const prevLesson = getPrevLesson();
              if (prevLesson) navigateToLesson(prevLesson);
            }}
          >
            <MaterialIcons name="skip-previous" size={20} color={Colors.light.tint} />
            <Text style={styles.navButtonText}>Oldingi dars</Text>
          </TouchableOpacity>
        )}
        
        {getNextLesson() && (
          <TouchableOpacity 
            style={[styles.navButton, styles.nextButton]}
            onPress={() => {
              const nextLesson = getNextLesson();
              if (nextLesson) navigateToLesson(nextLesson);
            }}
          >
            <Text style={styles.navButtonText}>Keyingi dars</Text>
            <MaterialIcons name="skip-next" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Course Lessons List */}
      {course && course.lessons && (
        <View style={styles.lessonsContainer}>
          <Text style={styles.lessonsTitle}>Kurs darslari</Text>
          {course.lessons
            .sort((a, b) => a.order_index - b.order_index)
            .map((lesson, index) => (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonItem,
                lesson.id === currentLesson.id && styles.currentLessonItem
              ]}
              onPress={() => navigateToLesson(lesson)}
              disabled={!lesson.is_preview && !hasAccess}
            >
              <View style={styles.lessonItemLeft}>
                <View style={[
                  styles.lessonNumber,
                  lesson.id === currentLesson.id && styles.currentLessonNumber
                ]}>
                  <Text style={styles.lessonNumberText}>
                    {lesson.order_index}
                  </Text>
                </View>
                <View style={styles.lessonItemInfo}>
                  <Text style={[
                    styles.lessonItemTitle,
                    lesson.id === currentLesson.id && styles.currentLessonTitle
                  ]}>
                    {lesson.title}
                  </Text>
                  <Text style={styles.lessonItemDuration}>
                    {lesson.duration_minutes} daqiqa
                    {lesson.is_preview && ' • Bepul'}
                  </Text>
                </View>
              </View>
              
              {lesson.is_preview || hasAccess ? (
                lesson.id === currentLesson.id ? (
                  <MaterialIcons name="play-arrow" size={20} color={Colors.light.tint} />
                ) : (
                  <MaterialIcons name="play-circle-outline" size={20} color={Colors.light.tabIconDefault} />
                )
              ) : (
                <MaterialIcons name="lock" size={20} color={Colors.light.tabIconDefault} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  menuBtn: {
    padding: 4,
    marginLeft: 12,
  },
  videoContainer: {
    position: 'relative',
    backgroundColor: 'black',
    aspectRatio: 16/9,
  },
  video: {
    flex: 1,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  noVideoText: {
    color: Colors.light.tabIconDefault,
    fontSize: 16,
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  videoControls: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  progressBar: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
  },
  lessonInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  lessonDuration: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 12,
  },
  lessonDescription: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  prevButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  nextButton: {
    backgroundColor: Colors.light.tint,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lessonsContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentLessonItem: {
    backgroundColor: '#f0f7ff',
  },
  lessonItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentLessonNumber: {
    backgroundColor: Colors.light.tint,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  lessonItemInfo: {
    flex: 1,
  },
  lessonItemTitle: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 2,
  },
  currentLessonTitle: {
    fontWeight: '600',
    color: Colors.light.tint,
  },
  lessonItemDuration: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
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
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  noAccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  noAccessText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  backButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});