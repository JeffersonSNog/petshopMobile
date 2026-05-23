import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';
import { SessionProvider } from './src/contexts/SessionContext';
import { PetsProvider } from './src/contexts/PetsContext';
import useSession from './src/hooks/useSession';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';

function AppContent() {
  const { isAuthenticated, loading, user, logout } = useSession();
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login' or 'register'

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A50" />
        <Text style={styles.loadingText}>Loading Pawfect Match...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    if (currentScreen === 'register') {
      return <RegisterScreen showLogin={() => setCurrentScreen('login')} />;
    }
    return <LoginScreen showRegister={() => setCurrentScreen('register')} />;
  }

  return <HomeScreen></HomeScreen>;

  {``` Logged-in screen (Tinder swipe deck placeholder)
  return (
  
  
    <View style={styles.container}>
      <Text style={styles.logoEmoji}>🐾</Text>
      <Text style={styles.title}>Tinder for Pets</Text>
      <Text style={styles.welcomeText}>Welcome, {user?.name || 'Friend'}!</Text>
    
      {/* Swipe deck placeholder */}
      <View style={styles.swipeCardPlaceholder}>
        <Text style={styles.swipeCardText}>Swipe cards interface coming soon!</Text>
      </View>
      
      <Pressable onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );```}
}

export default function App() {
  return (
    <SessionProvider>
      <PetsProvider>
        <AppContent />
      </PetsProvider>
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D2D2D',
  },
  welcomeText: {
    fontSize: 16,
    color: '#7E7E7E',
    marginTop: 8,
    marginBottom: 32,
  },
  swipeCardPlaceholder: {
    width: '100%',
    height: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF0EB',
    borderStyle: 'dashed',
    marginBottom: 32,
    padding: 20,
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  swipeCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7E7E7E',
    textAlign: 'center',
  },
  logoutButton: {
    height: 50,
    width: 200,
    backgroundColor: '#FFEBE5',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF7A50',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#7E7E7E',
    fontWeight: '600',
  },
});
