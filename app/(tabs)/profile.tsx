import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';

export default function ProfileScreen() {
  const { user, profile, updateProfile, signOut, loading: authLoading } = useAuth();
  const { enrolledCourses } = useCourses();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleSignOut = () => {
    Alert.alert(
      'Chiqish',
      'Haqiqatan ham tizimdan chiqmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Chiqish',
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!editForm.full_name.trim() || !editForm.username.trim()) {
      Alert.alert('Xatolik', 'Ism va foydalanuvchi nomi majburiy');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await updateProfile(editForm);
      
      if (error) {
        Alert.alert('Xatolik', error.message || 'Profilni yangilashda xatolik');
        return;
      }

      Alert.alert('Muvaffaqiyat', 'Profil muvaffaqiyatli yangilandi');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Xatolik', 'Profilni yangilashda xatolik');
    } finally {
      setUpdating(false);
    }
  };

  const getProgressStats = () => {
    if (enrolledCourses.length === 0) return { completed: 0, inProgress: 0, total: 0 };
    
    const completed = enrolledCourses.filter(course => course.progress >= 100).length;
    const inProgress = enrolledCourses.filter(course => course.progress > 0 && course.progress < 100).length;
    
    return {
      completed,
      inProgress,
      total: enrolledCourses.length
    };
  };

  const stats = getProgressStats();

  const renderProfileHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.avatarContainer}>
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.[0] || profile?.username?.[0] || 'U'}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.editAvatarBtn}>
          <MaterialIcons name="camera-alt" size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{profile?.full_name || 'Foydalanuvchi'}</Text>
        <Text style={styles.userEmail}>@{profile?.username || 'username'}</Text>
        <Text style={styles.userBio}>{profile?.bio || 'Bio qo\'shilmagan'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {profile?.role === 'admin' ? '👑 Admin' : 
             profile?.role === 'seller' ? '🎓 Instructor' : 
             '🎯 Student'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.editBtn}
        onPress={() => setEditModalVisible(true)}
      >
        <MaterialIcons name="edit" size={20} color={Colors.light.tint} />
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Kurslar</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.completed}</Text>
        <Text style={styles.statLabel}>Tugallangan</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.inProgress}</Text>
        <Text style={styles.statLabel}>Jarayonda</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
        </Text>
        <Text style={styles.statLabel}>Progress</Text>
      </View>
    </View>
  );

  const renderMenuSection = (title: string, items: any[]) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={item.onPress}
          disabled={item.disabled}
        >
          <View style={styles.menuItemLeft}>
            <MaterialIcons name={item.icon} size={24} color={item.color || Colors.light.text} />
            <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
              {item.title}
            </Text>
          </View>
          {item.switch ? (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#767577', true: Colors.light.tint }}
            />
          ) : (
            <MaterialIcons name="chevron-right" size={20} color={Colors.light.tabIconDefault} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setEditModalVisible(false)}>
            <Text style={styles.modalCancel}>Bekor qilish</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Profilni tahrirlash</Text>
          <TouchableOpacity onPress={handleUpdateProfile} disabled={updating}>
            <Text style={[styles.modalSave, updating && styles.modalSaveDisabled]}>
              {updating ? 'Saqlanmoqda...' : 'Saqlash'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>To'liq ism</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.full_name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, full_name: text }))}
              placeholder="Ismingizni kiriting"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Foydalanuvchi nomi</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.username}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, username: text }))}
              placeholder="Foydalanuvchi nomini kiriting"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={editForm.bio}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
              placeholder="O'zingiz haqingizda qisqacha ma'lumot..."
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Profil yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="person-off" size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.errorText}>Tizimga kiring</Text>
        </View>
      </SafeAreaView>
    );
  }

  const learningMenuItems = [
    {
      title: 'Mening kurslarim',
      icon: 'school',
      onPress: () => router.push('/my-courses' as any),
    },
    {
      title: 'Yuklab olinganlar',
      icon: 'download',
      onPress: () => Alert.alert('Ma\'lumot', 'Tez orada...'),
    },
    {
      title: 'Saqlanganlar',
      icon: 'bookmark',
      onPress: () => Alert.alert('Ma\'lumot', 'Tez orada...'),
    },
  ];

  const sellerMenuItems = profile?.role === 'seller' || profile?.role === 'admin' ? [
    {
      title: 'Instructor dashboard',
      icon: 'dashboard',
      onPress: () => router.push('/(seller)/dashboard'),
    },
    {
      title: 'Kurs yaratish',
      icon: 'add-circle',
      onPress: () => Alert.alert('Ma\'lumot', 'Tez orada...'),
    },
  ] : [];

  const settingsMenuItems = [
    {
      title: 'Qorong\'u rejim',
      icon: 'dark-mode',
      switch: true,
      value: darkMode,
      onValueChange: setDarkMode,
    },
    {
      title: 'Bildirishnomalar',
      icon: 'notifications',
      switch: true,
      value: notifications,
      onValueChange: setNotifications,
    },
    {
      title: 'Parol o\'zgartirish',
      icon: 'lock',
      onPress: () => Alert.alert('Ma\'lumot', 'Tez orada...'),
    },
    {
      title: 'Til',
      icon: 'language',
      onPress: () => Alert.alert('Ma\'lumot', 'Tez orada...'),
    },
  ];

  const supportMenuItems = [
    {
      title: 'Yordam',
      icon: 'help',
      onPress: () => Alert.alert('Ma\'lumot', 'Tez orada...'),
    },
    {
      title: 'Biz haqimizda',
      icon: 'info',
      onPress: () => Alert.alert('Ma\'lumot', 'Tez orada...'),
    },
    {
      title: 'Chiqish',
      icon: 'logout',
      color: '#ef4444',
      onPress: handleSignOut,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderStats()}
        {renderMenuSection('Ta\'lim', learningMenuItems)}
        {sellerMenuItems.length > 0 && renderMenuSection('Instructor', sellerMenuItems)}
        {renderMenuSection('Sozlamalar', settingsMenuItems)}
        {renderMenuSection('Yordam', supportMenuItems)}
      </ScrollView>
      {renderEditModal()}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.tint,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editBtn: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 16,
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
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.tabIconDefault,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  modalSaveDisabled: {
    color: Colors.light.tabIconDefault,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});