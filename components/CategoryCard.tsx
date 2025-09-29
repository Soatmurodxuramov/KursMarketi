import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  style?: any;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // Two cards per row with margins

// Category icons mapping
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('dastur') || name.includes('program')) return 'code';
  if (name.includes('dizayn') || name.includes('design')) return 'palette';
  if (name.includes('biznes') || name.includes('business')) return 'business';
  if (name.includes('fotograf') || name.includes('photo')) return 'photo-camera';
  if (name.includes('video')) return 'videocam';
  if (name.includes('musiqa') || name.includes('music')) return 'music-note';
  if (name.includes('til') || name.includes('language')) return 'language';
  if (name.includes('sog\'liq') || name.includes('health')) return 'favorite';
  if (name.includes('sport') || name.includes('fitness')) return 'fitness-center';
  if (name.includes('oshpaz') || name.includes('cooking')) return 'restaurant';
  return 'category';
};

// Category colors
const getCategoryColor = (index: number): string => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green  
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
  ];
  return colors[index % colors.length];
};

export default function CategoryCard({ category, onPress, style }: CategoryCardProps) {
  const iconName = getCategoryIcon(category.name);
  const backgroundColor = getCategoryColor(category.name.length);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name={iconName as any} 
          size={32} 
          color="white" 
        />
      </View>
      
      <Text style={styles.categoryName} numberOfLines={2}>
        {category.name}
      </Text>
      
      <View style={styles.arrow}>
        <MaterialIcons 
          name="arrow-forward" 
          size={16} 
          color="rgba(255,255,255,0.8)" 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: 120,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    alignSelf: 'flex-start',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    lineHeight: 20,
    marginTop: 8,
  },
  arrow: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});