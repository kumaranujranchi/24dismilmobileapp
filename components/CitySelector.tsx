import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface City {
  name: string;
  icon?: string;
}

const POPULAR_CITIES: City[] = [
  { name: 'Ahmedabad', icon: 'mosque' },
  { name: 'Bangalore', icon: 'building' },
  { name: 'Bhubaneswar', icon: 'place-of-worship' },
  { name: 'Chennai', icon: 'subway' },
  { name: 'Gurgaon', icon: 'hotel' },
  { name: 'Hyderabad', icon: 'archway' },
  { name: 'Jaipur', icon: 'fort-awesome' },
  { name: 'Kolkata', icon: 'landmark' },
  { name: 'Lucknow', icon: 'university' },
  { name: 'Mumbai', icon: 'landmark' },
  { name: 'New Delhi', icon: 'city' },
  { name: 'Noida', icon: 'building' },
  { name: 'Patna', icon: 'place-of-worship' },
  { name: 'Pune', icon: 'city' },
  { name: 'Goa', icon: 'umbrella-beach' },
  { name: 'Chandigarh', icon: 'tree' },
];

const MORE_CITIES = [
  'Ahmedabad', 'Bangalore', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai', 
  'Coimbatore', 'Faridabad', 'Gandhinagar', 'Ghaziabad', 'Goa', 'Greater Noida',
  'Guirim', 'Gurgaon', 'Hyderabad', 'Indore', 'Jaipur', 'Kochi', 'Kolkata',
  'Lucknow', 'Mumbai', 'Nagpur', 'Nashik', 'Navi Mumbai'
];

interface CitySelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  selectedCity: string;
}

export default function CitySelector({ visible, onClose, onSelect, selectedCity }: CitySelectorProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMoreCitiesExpanded, setIsMoreCitiesExpanded] = useState(false);

  const filteredMoreCities = MORE_CITIES.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select your preferred City</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <FontAwesome5 name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your city..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            {/* Popular Cities Grid */}
            <View style={styles.section}>
              <View style={styles.grid}>
                {POPULAR_CITIES.map((city, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.gridItem,
                      selectedCity === city.name && styles.selectedGridItem
                    ]}
                    onPress={() => onSelect(city.name)}
                  >
                    <View style={styles.iconContainer}>
                        <FontAwesome5 name={city.icon as any} size={24} color={selectedCity === city.name ? Colors.primary : '#9ca3af'} />
                    </View>
                    <Text style={[
                      styles.gridText,
                      selectedCity === city.name && styles.selectedGridText
                    ]}>{city.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Divider with More Cities toggle */}
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <TouchableOpacity 
                    style={styles.moreCitiesToggle}
                    onPress={() => setIsMoreCitiesExpanded(!isMoreCitiesExpanded)}
                >
                    <Text style={styles.moreCitiesText}>More Cities</Text>
                    <FontAwesome5 
                        name={isMoreCitiesExpanded ? "chevron-up" : "chevron-down"} 
                        size={12} 
                        color={Colors.dark} 
                        style={{ marginLeft: 6 }}
                    />
                </TouchableOpacity>
                <View style={styles.divider} />
            </View>

            {/* More Cities List */}
            {(isMoreCitiesExpanded || searchQuery.length > 0) && (
                <View style={styles.moreCitiesList}>
                    {filteredMoreCities.map((city, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.listItem}
                            onPress={() => onSelect(city)}
                        >
                            <View style={styles.bullet} />
                            <Text style={[
                                styles.listText,
                                selectedCity === city && styles.selectedListText
                            ]}>{city}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '92%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: Colors.dark,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.dark,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 40) / 4,
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  selectedGridItem: {
    backgroundColor: '#f9fafb',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  selectedGridText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  moreCitiesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  moreCitiesText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.dark,
  },
  moreCitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  listItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    marginRight: 10,
  },
  listText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  selectedListText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
});
