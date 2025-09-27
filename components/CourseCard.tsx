import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Course } from '@/types';
import { Colors } from '@/constants/Colors';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  style?: any;
  showProgress?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 40; // Full width with padding

export default function CourseCard({ course, onPress, style, showProgress = false }: CourseCardProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Bepul';
    return `${price.toLocaleString()} so'm`;
  };

  const renderProgressBar = () => {
    if (!showProgress || !course.progress) return null;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${course.progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{Math.round(course.progress)}%</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: course.thumbnail_url || 'https://via.placeholder.com/300x200' }}
          style={styles.thumbnail}
          contentFit="cover"
          placeholder="https://via.placeholder.com/300x200"
        />
        
        {/* Price badge */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            {formatPrice(course.price)}
          </Text>
        </View>
        
        {/* Enrolled badge */}
        {course.isEnrolled && (
          <View style={styles.enrolledBadge}>
            <MaterialIcons name="check-circle" size={16} color="white" />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        
        <View style={styles.instructorRow}>
          <Image
            source={{ uri: course.instructor.avatar_url || 'https://via.placeholder.com/24' }}
            style={styles.instructorAvatar}
            contentFit="cover"
            placeholder="https://via.placeholder.com/24"
          />
          <Text style={styles.instructorName}>
            {course.instructor.full_name || course.instructor.username}
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <View style={styles.rating}>
            <MaterialIcons name="star" size={14} color="#fbbf24" />
            <Text style={styles.ratingText}>
              {course.rating.toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>
              ({course.total_reviews || 0})
            </Text>
          </View>
          
          <View style={styles.duration}>
            <MaterialIcons name="access-time" size={14} color={Colors.light.tabIconDefault} />
            <Text style={styles.durationText}>
              {Math.round(course.duration_minutes / 60)}h {course.duration_minutes % 60}m
            </Text>
          </View>
        </View>
        
        <View style={styles.tagsRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{course.level}</Text>
          </View>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {course.category?.name || 'Kategoriya'}
            </Text>
          </View>
        </View>
        
        {renderProgressBar()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
    overflow: 'hidden',
    width: cardWidth,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  enrolledBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    padding: 4,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  instructorName: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginLeft: 2,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3b82f6',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
});