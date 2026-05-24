import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Image,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from './ProfileScreen';

const pet_categories = [
  {
    id: 1,
    title: 'Dog',
    emoji: '🐶',
    active: false,
  },
  {
    id: 2,
    title: 'Cat',
    emoji: '🐱',
    active: true,
  },
  {
    id: 3,
    title: 'Birds',
    emoji: '🦜',
    active: false,
  },
  {
    id: 4,
    title: 'Fish',
    emoji: '🐠',
    active: false,
  },
];

const pets = [
  {
    id: 1,
    name: 'Neko',
    breed: 'Scottish Fold · Kitten · Female',
    distance: '1.8 km away',
    price: '$820',
    image:
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Milo',
    breed: 'Orange Cat · Male',
    distance: '2.1 km away',
    price: '$760',
    image:
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=800&auto=format&fit=crop',
  },
];

export function HomeScreen() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {activeTab === 'home' ? (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hi, Justine 👋🏻</Text>
                <Text style={styles.subtitle}>Good morning</Text>
              </View>

              <Pressable style={styles.notificationButton}>
                <Ionicons name="notifications-outline" style={styles.notificationIcon}/>
              </Pressable>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" style={styles.searchIcon}/>
              
                <TextInput
                  placeholder="Search by breed, size, or name"
                  placeholderTextColor="#9B9B9B"
                  style={styles.searchInput}
                />
              </View>

              <Pressable style={styles.filterButton}>
                <Ionicons name="options-outline" style={styles.filterIcon}/>
              </Pressable>
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {pet_categories.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.categoryCard,
                    item.active && styles.categoryCardActive,
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      item.active && styles.categoryTextActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Pet Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
            >
              {pets.map((pet) => (
                <View key={pet.id} style={styles.petCard}>

                  <View style={styles.petInfoTop}>
                    <View>
                      <Text style={styles.sectionTitle}>Distance</Text>
                      <Text style={styles.sectionSubtitle}>{pet.distance}</Text>
                    </View>

                    <View>
                      <Text style={styles.sectionTitle}>Tags</Text>
                      <Text style={styles.tagText}>Quiet</Text>
                      <Text style={styles.tagText}>Snuggly</Text>
                      <Text style={styles.tagText}>Indoor</Text>
                    </View>
                  </View>

                  <View style={styles.imageWrapper}>
                    <View style={styles.imageBackground} />

                    <Image
                      source={{ uri: pet.image }}
                      style={styles.petImage}
                    />
                  </View>

                  <View style={styles.petFooter}>
                    <View>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petBreed}>{pet.breed}</Text>
                    </View>

                    <Text style={styles.petPrice}>{pet.price}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        ) : activeTab === 'profile' ? (
          <ProfileScreen />
        ) : null}

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <Pressable 
            onPress={() => setActiveTab('home')} 
            style={[styles.navButton, activeTab === 'home' && styles.navButtonActive]}
          >
            <Ionicons name="home-outline" size={25} color={activeTab === 'home' ? '#FFFFFF' : '#2D2D2D'}/>
          </Pressable>

          <Pressable 
            onPress={() => setActiveTab('favorites')} 
            style={[styles.navButton, activeTab === 'favorites' && styles.navButtonActive]}
          >
            <Ionicons name="heart-outline" size={25} color={activeTab === 'favorites' ? '#FFFFFF' : '#2D2D2D'}/>
          </Pressable>

          <Pressable 
            onPress={() => setActiveTab('messages')} 
            style={[styles.navButton, activeTab === 'messages' && styles.navButtonActive]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={25} color={activeTab === 'messages' ? '#FFFFFF' : '#2D2D2D'}/>
          </Pressable>

          <Pressable 
            onPress={() => setActiveTab('profile')} 
            style={[styles.navButton, activeTab === 'profile' && styles.navButtonActive]}
          >
            <Ionicons name="person-outline" size={25} color={activeTab === 'profile' ? '#FFFFFF' : '#2D2D2D'}/>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#292929ff',
  },
  subtitle: {
    marginTop: 4,
    color: '#242424ff',
    fontSize: 14,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  notificationIcon: {
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  searchInputContainer: {
    flex: 1,
    height: 50,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    color: '#1F1F1F',
    fontSize: 16,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 24,
  },
  categoryCard: {
    width: 82,
    height: 110,
    borderRadius: 60,
    backgroundColor: '#F7F7F7',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  categoryCardActive: {
    backgroundColor: '#F4A940',
    borderColor: '#F4A940',
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryText: {
    color: '#2D2D2D',
    fontWeight: '600',
  },
  cardsContainer: {
      alignSelf: 'flex-start',
    paddingBottom: 24,
  },
  petCard: {
    width: 320,
    borderRadius: 32,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  petInfoTop: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  tagText: {
    fontSize: 12,
    color: '#8B8B8B',
    marginBottom: 2,
  },
  imageWrapper: {
    height: 190,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5,
  },
  imageBackground: {
    position: 'absolute',
    width: 220,
    height: 300,
    backgroundColor: '#F4A940',
    borderTopLeftRadius: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    right: 0,
    bottom: 0,
  },
  petImage: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 210,
    height: 290,
    borderTopLeftRadius: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    resizeMode: 'cover',
  },
  petFooter: {
    backgroundColor: '#F4A940',
    height: 100,
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  petName: {
    fontSize: 24,
    fontWeight: '400',
    color: '#1F1F1F',
  },
  petBreed: {
    marginTop: 4,
    fontSize: 12,
    color: '#8B8B8B',
    maxWidth: 160,
  },
  petPrice: {
    fontSize: 24,
    fontWeight: '400',
    color: '#F4A940',
  },
  bottomNavigation: {
  position: 'absolute',
  bottom: 24,
  left: 20,
  right: 20,

  height: 72,
  borderRadius: 28,

  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
},
  navButton: {
    width: 64,
    height: 64,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#EEEEEE',
    marginHorizontal: 1,
  },
  navButtonActive: {
    backgroundColor: '#F4A940',
  },
});

