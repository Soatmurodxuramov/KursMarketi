import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Lesson } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

// Web-compatible alert
const showAlert = (title: string, message: string, onConfirm?: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm?.();
    }
  } else {
    Alert.alert(title, message, onConfirm ? [{ text: 'OK', onPress: onConfirm }] : undefined);
  }
};

export default function LessonScreen() {
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadLessonData();
  }, [courseId, lessonId]);

  const loadLessonData = async () => {
    setLoading(true);
    try {
      // Sample lesson data
      const sampleLesson: Lesson = {
        id: lessonId || '1',
        course_id: courseId,
        title: `Dars ${lessonId}: React Native asoslari`,
        description: `Bu darsda React Native asosiy tushunchalari, komponentlar yaratish va ulardan foydalanish haqida batafsil ma'lumot olasiz. Shuningdek, State va Props tushunchalarini ham o'rganamiz.

Dars davomida quyidagi mavzularni ko'rib chiqamiz:
1. React Native komponentlari
2. State management
3. Props va ulardan foydalanish
4. Event handling
5. Styling va layout

Ushbu bilimlar React Native ilovalar yaratishning poydevori hisoblanadi.`,
        video_url: 'https://example.com/video.mp4',
        duration_minutes: 45,
        order_index: parseInt(lessonId || '1'),
        is_preview: lessonId === '1',
        resources_urls: [
          'https://example.com/lesson-notes.pdf',
          'https://example.com/source-code.zip'
        ],
        created_at: new Date().toISOString()
      };

      setLesson(sampleLesson);
      // Simulate user progress
      setProgress(Math.random() * 100);
    } catch (error) {
      console.error('Error loading lesson:', error);
      showAlert('Xatolik', 'Dars ma\'lumotlarini yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    // In real app, control video player
  };

  const handleMarkComplete = () => {
    showAlert(
      'Darsni tugatish',
      'Bu darsni tugatilgan deb belgilamoqchimisiz?',
      () => {
        setProgress(100);
        showAlert('Tabriklaymiz!', 'Dars muvaffaqiyatli yakunlandi!');
      }
    );
  };

  const handleNextLesson = () => {
    const nextLessonId = (parseInt(lessonId || '1') + 1).toString();
    router.push(`/lesson/${courseId}/${nextLessonId}`);
  };

  const handlePreviousLesson = () => {
    if (parseInt(lessonId || '1') > 1) {
      const prevLessonId = (parseInt(lessonId || '1') - 1).toString();
      router.push(`/lesson/${courseId}/${prevLessonId}`);
    }
  };

  const handleDownloadResource = (url: string) => {
    showAlert('Yuklab olish', 'Fayl yuklab olinmoqda...');
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

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.errorText}>Dars topilmadi</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lesson.title}
        </Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowNotes(!showNotes)}
        >
          <MaterialIcons 
            name={showNotes ? "note" : "note-add"} 
            size={24} 
            color={Colors.light.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Video Player Placeholder */}
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
              <MaterialIcons 
                name={playing ? "pause" : "play-arrow"} 
                size={48} 
                color="white" 
              />
            </TouchableOpacity>
            
            {/* Video Controls */}
            <View style={styles.videoControls}>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lesson Info */}
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MaterialIcons name="access-time" size={16} color={Colors.light.tabIconDefault} />
              <Text style={styles.metaText}>{lesson.duration_minutes} daqiqa</Text>
            </View>
            
            <View style={styles.metaItem}>
              <MaterialIcons name="visibility" size={16} color={Colors.light.tabIconDefault} />
              <Text style={styles.metaText}>Dars {lesson.order_index}</Text>
            </View>
          </View>

          <Text style={styles.lessonDescription}>{lesson.description}</Text>
        </View>

        {/* Resources */}
        {lesson.resources_urls && lesson.resources_urls.length > 0 && (
          <View style={styles.resourcesSection}>
            <Text style={styles.sectionTitle}>Qo'shimcha materiallar</Text>
            {lesson.resources_urls.map((url, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.resourceItem}
                onPress={() => handleDownloadResource(url)}
              >
                <MaterialIcons name="file-download" size={20} color={Colors.light.tint} />
                <Text style={styles.resourceText}>
                  {url.includes('.pdf') ? 'Dars konspekti (PDF)' : 'Manba kodlari (ZIP)'}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={Colors.light.tabIconDefault} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Notes Section */}
        {showNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Eslatmalar</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesPlaceholder}>
                Bu yerda dars davomida yozgan eslatmalaringizni ko'rishingiz mumkin...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navButton, parseInt(lessonId || '1') === 1 && styles.navButtonDisabled]}
          onPress={handlePreviousLesson}
          disabled={parseInt(lessonId || '1') === 1}
        >
          <MaterialIcons name="skip-previous" size={24} color={
            parseInt(lessonId || '1') === 1 ? Colors.light.tabIconDefault : Colors.light.tint
          } />
          <Text style={[
            styles.navButtonText,
            parseInt(lessonId || '1') === 1 && styles.navButtonTextDisabled
          ]}>
            Oldingi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.completeButton, progress === 100 && styles.completedButton]}
          onPress={handleMarkComplete}
          disabled={progress === 100}
        >
          <MaterialIcons 
            name={progress === 100 ? "check-circle" : "check"} 
            size={20} 
            color="white" 
          />
          <Text style={styles.completeButtonText}>
            {progress === 100 ? 'Tugatilgan' : 'Tugatish'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={handleNextLesson}
        >
          <MaterialIcons name="skip-next" size={24} color={Colors.light.tint} />
          <Text style={styles.navButtonText}>Keyingi</Text>
        </TouchableOpacity>
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
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  videoContainer: {
    backgroundColor: 'black',
  },
  videoPlaceholder: {
    width: screenWidth,
    height: screenWidth * 9 / 16, // 16:9 aspect ratio
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoControls: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lessonInfo: {
    padding: 20,
    backgroundColor: 'white',
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  lessonDescription: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  resourcesSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resourceText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  notesSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 20,
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    minHeight: 100,
  },
  notesPlaceholder: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontStyle: 'italic',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  navButtonTextDisabled: {
    color: Colors.light.tabIconDefault,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginHorizontal: 20,
  },
  completedButton: {
    backgroundColor: '#28a745',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
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
    fontWeight: 'bold',
  },
});