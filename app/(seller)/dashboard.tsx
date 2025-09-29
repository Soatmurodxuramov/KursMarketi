import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import supabase from '@/services/supabase';
import { Course } from '@/types';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  pendingCourses: number;
  activeCourses: number;
}

export default function SellerDashboard() {
  const { user, profile } = useAuth();
  const { courses: allCourses } = useCourses();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingCourses: 0,
    activeCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch seller's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          category:categories(*),
          instructor:user_profiles(*),
          lessons:lessons(count)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (coursesError) {
        throw coursesError;
      }

      setMyCourses(coursesData || []);

      // Calculate stats
      const totalCourses = coursesData?.length || 0;
      const activeCourses = coursesData?.filter(c => c.status === 'approved').length || 0;
      const pendingCourses = coursesData?.filter(c => c.status === 'pending').length || 0;
      const totalStudents = coursesData?.reduce((sum, course) => sum + (course.total_students || 0), 0) || 0;
      const totalRevenue = coursesData?.reduce((sum, course) => sum + (course.price * (course.total_students || 0)), 0) || 0;
      const averageRating = totalCourses > 0 
        ? coursesData.reduce((sum, course) => sum + course.rating, 0) / totalCourses 
        : 0;

      setStats({
        totalCourses,
        totalStudents,
        totalRevenue,
        averageRating,
        pendingCourses,
        activeCourses,
      });

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Xatolik', 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
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
    Alert.alert('Kurs yaratish', 'Kurs yaratish funksiyasi tez orada qo\'shiladi');
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeTitle}>
        Xush kelibsiz, {profile?.full_name || 'Instructor'}! 👋
      </Text>
      <Text style={styles.welcomeSubtitle}>
        {profile?.role === 'admin' ? 'Admin panel boshqaruvi' : 'Instructor dashboard'}
      </Text>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <MaterialIcons name="school" size={24} color="white" />
          <Text style={styles.statNumber}>{stats.totalCourses}</Text>
          <Text style={styles.statLabel}>Jami kurslar</Text>
        </View>
        
        <View style={[styles.statCard, styles.successCard]}>
          <MaterialIcons name="people" size={24} color="white" />
          <Text style={styles.statNumber}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>Talabalar</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.warningCard]}>
          <MaterialIcons name="attach-money" size={24} color="white" />
          <Text style={styles.statNumber}>
            {(stats.totalRevenue / 1000).toFixed(0)}k
          </Text>
          <Text style={styles.statLabel}>Daromad (so'm)</Text>
        </View>
        
        <View style={[styles.statCard, styles.infoCard]}>
          <MaterialIcons name="star" size={24} color="white" />
          <Text style={styles.statNumber}>
            {stats.averageRating.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>O'rtacha reyting</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tezkor amallar</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionCard, styles.createCourseCard]}
          onPress={handleCreateCourse}
        >
          <MaterialIcons name="add-circle" size={32} color="white" />
          <Text style={styles.actionTitle}>Yangi kurs</Text>
          <Text style={styles.actionSubtitle}>Kurs yaratish</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionCard, styles.analyticsCard]}
          onPress={() => Alert.alert('Ma\'lumot', 'Tez orada...')}
        >
          <MaterialIcons name="analytics" size={32} color="white" />
          <Text style={styles.actionTitle}>Analitika</Text>
          <Text style={styles.actionSubtitle}>Statistika ko'rish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCoursesList = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mening kurslarim</Text>
        <Text style={styles.sectionCount}>{myCourses.length} ta</Text>
      </View>
      
      {myCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="school" size={48} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyTitle}>Hali kurslaringiz yo'q</Text>
          <Text style={styles.emptySubtitle}>
            Birinchi kursingizni yaratib, talabalar bilan bilimlaringizni ulashing
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateCourse}>
            <Text style={styles.createButtonText}>Kurs yaratish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.coursesContainer}>
          {myCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseItem}
              onPress={() => handleCoursePress(course.id)}
            >
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>
                  {course.title}
                </Text>
                <Text style={styles.courseStats}>
                  {course.total_students} talaba • ⭐ {course.rating.toFixed(1)}
                </Text>
                <View style={styles.courseRow}>
                  <Text style={styles.coursePrice}>
                    {course.price.toLocaleString()} so'm
                  </Text>
                  <View style={[
                    styles.statusBadge, 
                    course.status === 'approved' ? styles.approvedBadge :
                    course.status === 'pending' ? styles.pendingBadge :
                    styles.rejectedBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      course.status === 'approved' ? styles.approvedText :
                      course.status === 'pending' ? styles.pendingText :
                      styles.rejectedText
                    ]}>
                      {course.status === 'approved' ? 'Tasdiqlangan' :
                       course.status === 'pending' ? 'Kutilmoqda' :
                       'Rad etilgan'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <MaterialIcons name="chevron-right" size={20} color={Colors.light.tabIconDefault} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Dashboard yuklanmoqda...</Text>
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
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeSection()}
        {renderStatsCards()}
        {renderQuickActions()}
        {renderCoursesList()}
      </ScrollView>
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
  welcomeSection: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: Colors.light.tint,
  },
  successCard: {
    backgroundColor: '#10b981',
  },
  warningCard: {
    backgroundColor: '#f59e0b',
  },
  infoCard: {
    backgroundColor: '#6366f1',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  sectionCount: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  createCourseCard: {
    backgroundColor: '#10b981',
  },
  analyticsCard: {
    backgroundColor: '#6366f1',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  coursesContainer: {
    paddingHorizontal: 20,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  courseStats: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 8,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coursePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  approvedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  rejectedBadge: {
    backgroundColor: '#fecaca',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  approvedText: {
    color: '#16a34a',
  },
  pendingText: {
    color: '#d97706',
  },
  rejectedText: {
    color: '#dc2626',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
});