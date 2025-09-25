import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { CourseService } from '@/services/courseService';
import { PaymentService } from '@/services/paymentService';
import { Colors } from '@/constants/Colors';

export default function SellerDashboard() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Alert state for web compatibility
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  useEffect(() => {
    if (profile?.role !== 'seller' && profile?.role !== 'admin') {
      showWebAlert('Access Denied', 'Sizda seller dashboard ga kirish huquqi yo\'q');
      router.back();
      return;
    }
    
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      // Load seller courses
      const { data: coursesData } = await CourseService.getCoursesByInstructor(profile.id);
      setCourses(coursesData || []);

      // Load earnings data
      const { data: earningsData } = await PaymentService.getSellerEarnings();
      
      if (earningsData) {
        setStats({
          totalEarnings: earningsData.total || 0,
          monthlyEarnings: earningsData.monthly || 0,
          totalCourses: coursesData?.length || 0,
          totalStudents: coursesData?.reduce((sum, course) => sum + (course.total_students || 0), 0) || 0,
          averageRating: coursesData?.length > 0 
            ? coursesData.reduce((sum, course) => sum + (course.rating || 0), 0) / coursesData.length 
            : 0,
        });
      }
    } catch (error) {
      showWebAlert('Error', 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleCreateCourse = () => {
    router.push('/(seller)/create-course');
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/(seller)/edit-course/${courseId}`);
  };

  const handleViewAnalytics = () => {
    router.push('/(seller)/analytics');
  };

  const handleRequestPayout = async () => {
    if (stats.totalEarnings < 50000) { // Minimum payout threshold
      showWebAlert('Insufficient Balance', 'Minimum payout amount 50,000 so\'m');
      return;
    }

    try {
      const { error } = await PaymentService.requestPayout(stats.totalEarnings);
      
      if (error) {
        showWebAlert('Error', error.message);
        return;
      }
      
      showWebAlert('Success', 'Payout so\'rovi muvaffaqiyatli yuborildi');
      loadDashboardData(); // Refresh data
    } catch (error) {
      showWebAlert('Error', 'Payout so\'rovida xatolik yuz berdi');
    }
  };

  const renderStatsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Statistika</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialIcons name="attach-money" size={28} color={Colors.light.tint} />
          <Text style={styles.statNumber}>
            {(stats.totalEarnings / 1000).toFixed(1)}K
          </Text>
          <Text style={styles.statLabel}>Umumiy daromad</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="trending-up" size={28} color="#10b981" />
          <Text style={styles.statNumber}>
            {(stats.monthlyEarnings / 1000).toFixed(1)}K
          </Text>
          <Text style={styles.statLabel}>Bu oy</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="school" size={28} color="#6366f1" />
          <Text style={styles.statNumber}>{stats.totalCourses}</Text>
          <Text style={styles.statLabel}>Kurslar</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="people" size={28} color="#f59e0b" />
          <Text style={styles.statNumber}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>Talabalar</Text>
        </View>
      </View>
    </View>
  );

  const renderActionsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tezkor amallar</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={handleCreateCourse}>
          <MaterialIcons name="add-circle" size={32} color={Colors.light.tint} />
          <Text style={styles.actionTitle}>Yangi kurs</Text>
          <Text style={styles.actionSubtitle}>Kurs yaratish</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={handleViewAnalytics}>
          <MaterialIcons name="analytics" size={32} color="#10b981" />
          <Text style={styles.actionTitle}>Statistika</Text>
          <Text style={styles.actionSubtitle}>Batafsil tahlil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={handleRequestPayout}>
          <MaterialIcons name="payment" size={32} color="#f59e0b" />
          <Text style={styles.actionTitle}>Payout</Text>
          <Text style={styles.actionSubtitle}>Pul yechish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCoursesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sizning kurslaringiz</Text>
        <TouchableOpacity onPress={handleCreateCourse}>
          <MaterialIcons name="add" size={24} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>
      
      {courses.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="school" size={48} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyTitle}>Hali kurslar mavjud emas</Text>
          <Text style={styles.emptySubtitle}>
            Birinchi kursingizni yarating va talabalar bilan bilim ulashing
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateCourse}>
            <Text style={styles.createButtonText}>Kurs yaratish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        courses.map((course: any) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseCard}
            onPress={() => handleEditCourse(course.id)}
          >
            <View style={styles.courseHeader}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <View style={[styles.statusBadge, getStatusStyle(course.status)]}>
                <Text style={[styles.statusText, getStatusTextStyle(course.status)]}>
                  {getStatusLabel(course.status)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.courseDescription} numberOfLines={2}>
              {course.description}
            </Text>
            
            <View style={styles.courseStats}>
              <View style={styles.courseStat}>
                <MaterialIcons name="people" size={16} color={Colors.light.tabIconDefault} />
                <Text style={styles.courseStatText}>{course.total_students || 0} talaba</Text>
              </View>
              
              <View style={styles.courseStat}>
                <MaterialIcons name="star" size={16} color={Colors.light.tabIconDefault} />
                <Text style={styles.courseStatText}>{course.rating || 0}</Text>
              </View>
              
              <View style={styles.courseStat}>
                <MaterialIcons name="attach-money" size={16} color={Colors.light.tabIconDefault} />
                <Text style={styles.courseStatText}>{course.price.toLocaleString()} so'm</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: '#dcfce7' };
      case 'pending':
        return { backgroundColor: '#fef3c7' };
      case 'rejected':
        return { backgroundColor: '#fee2e2' };
      default:
        return { backgroundColor: '#f3f4f6' };
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: '#166534' };
      case 'pending':
        return { color: '#92400e' };
      case 'rejected':
        return { color: '#dc2626' };
      default:
        return { color: '#6b7280' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Tasdiqlangan';
      case 'pending':
        return 'Kutilmoqda';
      case 'rejected':
        return 'Rad etilgan';
      default:
        return 'Qoralama';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seller Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Xush kelibsiz, {profile?.full_name || profile?.username}!
          </Text>
        </View>

        {renderStatsSection()}
        {renderActionsSection()}
        {renderCoursesSection()}
      </ScrollView>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
    textAlign: 'center',
  },
  courseCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
    marginBottom: 12,
  },
  courseStats: {
    flexDirection: 'row',
    gap: 16,
  },
  courseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseStatText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    minWidth: 280,
    maxWidth: 340,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.light.text,
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: Colors.light.text,
  },
  alertButton: {
    backgroundColor: Colors.light.tint,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});