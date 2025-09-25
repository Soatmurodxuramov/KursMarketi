import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Mock user data
  const user = {
    name: 'Foydalanuvchi',
    email: 'user@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    enrolledCourses: 2,
    completedCourses: 1,
    totalHours: 8.5,
  };

  const menuItems = [
    {
      icon: 'edit',
      title: 'Profilni tahrirlash',
      onPress: () => Alert.alert('Profilni tahrirlash', 'Bu funksiya tez orada qo\'shiladi'),
    },
    {
      icon: 'notifications',
      title: 'Bildirishnomalar',
      onPress: () => Alert.alert('Bildirishnomalar', 'Bu funksiya tez orada qo\'shiladi'),
    },
    {
      icon: 'download',
      title: 'Yuklab olishlar',
      onPress: () => Alert.alert('Yuklab olishlar', 'Bu funksiya tez orada qo\'shiladi'),
    },
    {
      icon: 'settings',
      title: 'Sozlamalar',
      onPress: () => Alert.alert('Sozlamalar', 'Bu funksiya tez orada qo\'shiladi'),
    },
    {
      icon: 'help',
      title: 'Yordam',
      onPress: () => Alert.alert('Yordam', 'Savollaringiz uchun support@coursemarketplace.uz ga murojaat qiling'),
    },
    {
      icon: 'info',
      title: 'Ilova haqida',
      onPress: () => Alert.alert('Ilova haqida', 'Kurs Marketi v1.0.0\nEng yaxshi kurslarni o\'rganing!'),
    },
  ];

  const MenuItem: React.FC<{ item: typeof menuItems[0] }> = ({ item }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
          <MaterialIcons name={item.icon as any} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.menuTitle, { color: colors.text }]}>
          {item.title}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={colors.text} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Profil
        </Text>
      </View>

      {/* Profile Info */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.name}
          </Text>
          <Text style={[styles.userEmail, { color: colors.text }]}>
            {user.email}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {user.enrolledCourses}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>
            Yozilgan kurslar
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {user.completedCourses}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>
            Tugallangan
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>
            {user.totalHours}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>
            Soat o'rgangansiz
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
        onPress={() => Alert.alert('Chiqish', 'Hisobingizdan chiqmoqchimisiz?', [
          { text: 'Bekor qilish', style: 'cancel' },
          { text: 'Chiqish', style: 'destructive', onPress: () => Alert.alert('Chiqish', 'Bu funksiya tez orada qo\'shiladi') }
        ])}
        activeOpacity={0.7}
      >
        <MaterialIcons name="logout" size={20} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>
          Hisobdan chiqish
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});