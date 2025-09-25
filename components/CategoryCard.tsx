import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Category } from '@/types';
import { Colors } from '@/constants/Colors';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

const categoryIcons: { [key: string]: keyof typeof MaterialIcons.glyphMap } = {
  programming: 'code',
  design: 'palette',
  business: 'business',
  marketing: 'trending-up',
  photography: 'camera-alt',
  music: 'music-note',
  language: 'translate',
  default: 'school'
};

const categoryColors: { [key: string]: string } = {
  programming: '#3b82f6',
  design: '#8b5cf6',
  business: '#10b981',
  marketing: '#f59e0b',
  photography: '#ef4444',
  music: '#ec4899',
  language: '#06b6d4',
  default: '#6b7280'
};

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  const iconName = categoryIcons[category.slug] || categoryIcons.default;
  const backgroundColor = categoryColors[category.slug] || categoryColors.default;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor }]}>
        <MaterialIcons name={iconName} size={24} color="white" />
      </View>
      
      <Text style={styles.categoryName} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    marginRight: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});