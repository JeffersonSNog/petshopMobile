import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useSession from '../hooks/useSession';
import api from '../../utils/api';

export default function ProfileScreen() {
  const { user, logout } = useSession();
  const [profileUser, setProfileUser] = useState(user);
  const [activeSection, setActiveSection] = useState('mypets'); // 'mypets' or 'myadoptions'
  const [myPets, setMyPets] = useState([]);
  const [myAdoptions, setMyAdoptions] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [loadingAdoptions, setLoadingAdoptions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Parse and format registration date to Portuguese
  const formatRegistrationDate = (dateString) => {
    if (!dateString) return 'Membro desde recente';
    try {
      const date = new Date(dateString);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      // Format: "24 de maio de 2026"
      const formatted = date.toLocaleDateString('pt-BR', options);
      return `Membro desde ${formatted}`;
    } catch (e) {
      return 'Membro desde recente';
    }
  };

  // Generate initials for the avatar badge
  const getUserInitials = (name) => {
    if (!name) return '🐾';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Fetch full user profile details
  const fetchUserProfile = async () => {
    try {
      const data = await api.checkUser();
      if (data) {
        setProfileUser(data);
      }
    } catch (err) {
      console.error('Erro ao buscar dados completos do usuário:', err);
    }
  };

  // Fetch pets registered by the user
  const fetchMyPets = async (showLoader = true) => {
    if (showLoader) setLoadingPets(true);
    try {
      const data = await api.getMyPets();
      setMyPets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar meus pets:', err);
    } finally {
      if (showLoader) setLoadingPets(false);
    }
  };

  // Fetch adoptions requested by the user
  const fetchMyAdoptions = async (showLoader = true) => {
    if (showLoader) setLoadingAdoptions(true);
    try {
      const data = await api.getMyAdoptions();
      setMyAdoptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar minhas adoções:', err);
      throw err; // Propagate error so fetchMyAdoptions can handle it or log it
    } finally {
      if (showLoader) setLoadingAdoptions(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUserProfile();
    fetchMyPets();
    fetchMyAdoptions().catch((err) => {
      // Quietly catch here, already logged and toast shown if needed
    });
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserProfile(),
      fetchMyPets(false),
      fetchMyAdoptions(false).catch(() => {})
    ]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza de que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout }
      ]
    );
  };

  // Render a single pet item card
  const renderPetItem = ({ item }) => {
    const isAvailable = item.available !== false;
    const petImage = item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <View style={styles.petCard}>
        {petImage ? (
          <Image source={{ uri: petImage }} style={styles.petThumbnail} />
        ) : (
          <View style={[styles.petThumbnail, styles.petThumbnailPlaceholder]}>
            <Text style={styles.pawIcon}>🐾</Text>
          </View>
        )}
        <View style={styles.petInfoContainer}>
          <Text style={styles.petCardName}>{item.name}</Text>
          <Text style={styles.petCardBreed} numberOfLines={1}>{item.breed || 'Raça não definida'}</Text>
          
          <View style={styles.badgeWrapper}>
            {activeSection === 'mypets' ? (
              <View style={[styles.statusBadge, isAvailable ? styles.badgeAvailable : styles.badgeUnavailable]}>
                <Text style={[styles.statusBadgeText, isAvailable ? styles.badgeAvailableText : styles.badgeUnavailableText]}>
                  {isAvailable ? 'Disponível' : 'Adotado / Inativo'}
                </Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.badgeAdoption]}>
                <Text style={[styles.statusBadgeText, styles.badgeAdoptionText]}>
                  Adoção em Andamento
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Header of the scroll view containing user details
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{getUserInitials(profileUser?.name)}</Text>
        </View>
        <Text style={styles.profileName}>{profileUser?.name || 'Usuário Pawfect'}</Text>
        <Text style={styles.profileEmail}>{profileUser?.email || 'email@exemplo.com'}</Text>
        <Text style={styles.registrationDate}>{formatRegistrationDate(profileUser?.createdAt)}</Text>
      </View>

      {/* Account Info Details Card */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#E07B39" style={styles.infoIcon} />
          <View>
            <Text style={styles.infoLabel}>Nome Completo</Text>
            <Text style={styles.infoValue}>{profileUser?.name || 'Não cadastrado'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#E07B39" style={styles.infoIcon} />
          <View>
            <Text style={styles.infoLabel}>E-mail</Text>
            <Text style={styles.infoValue}>{profileUser?.email || 'Não cadastrado'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#E07B39" style={styles.infoIcon} />
          <View>
            <Text style={styles.infoLabel}>Telefone / Contato</Text>
            <Text style={styles.infoValue}>{profileUser?.phone || 'Não cadastrado'}</Text>
          </View>
        </View>
      </View>

      {/* Segmented Control / Navigation inside profile */}
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveSection('mypets')}
          style={[styles.tabButton, activeSection === 'mypets' && styles.tabButtonActive]}
        >
          <Ionicons 
            name="paw-outline" 
            size={18} 
            color={activeSection === 'mypets' ? '#FFFFFF' : '#7E7E7E'} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabButtonText, activeSection === 'mypets' && styles.tabButtonTextActive]}>
            Meus Pets ({myPets.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveSection('myadoptions')}
          style={[styles.tabButton, activeSection === 'myadoptions' && styles.tabButtonActive]}
        >
          <Ionicons 
            name="heart-outline" 
            size={18} 
            color={activeSection === 'myadoptions' ? '#FFFFFF' : '#7E7E7E'} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabButtonText, activeSection === 'myadoptions' && styles.tabButtonTextActive]}>
            Minhas Adoções ({myAdoptions.length})
          </Text>
        </Pressable>
      </View>
    </View>
  );

  // Footer of the list containing the logout action
  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color="#FF7A50" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </Pressable>
    </View>
  );

  // Empty list state placeholder
  const renderEmptyState = () => {
    const isPets = activeSection === 'mypets';
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Text style={styles.emptyIcon}>{isPets ? '🐾' : '❤️'}</Text>
        </View>
        <Text style={styles.emptyTitle}>
          {isPets ? 'Nenhum pet cadastrado' : 'Nenhuma adoção solicitada'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isPets 
            ? 'Você ainda não cadastrou nenhum pet para adoção na plataforma.' 
            : 'Explore os animais disponíveis e agende uma visita para adotar um novo amigo!'}
        </Text>
      </View>
    );
  };

  const currentList = activeSection === 'mypets' ? myPets : myAdoptions;
  const isLoading = activeSection === 'mypets' ? loadingPets : loadingAdoptions;

  return (
    <View style={styles.container}>
      <FlatList
        data={isLoading ? [] : currentList}
        renderItem={renderPetItem}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={isLoading ? null : renderFooter}
        ListEmptyComponent={isLoading ? null : renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponentStyle={{ width: '100%' }}
        ListFooterComponentStyle={{ width: '100%' }}
      />
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E07B39" />
          <Text style={styles.loaderText}>Buscando informações da API...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110, // Ensure space above bottom navigation bar
  },
  headerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFF0EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFF0EB',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E07B39',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D2D2D',
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 14,
    color: '#7E7E7E',
    marginTop: 4,
    textAlign: 'center',
  },
  registrationDate: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 8,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D2D2D',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7E7E7E',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D2D2D',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3EFE9',
    borderRadius: 14,
    padding: 4,
    width: '100%',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#E07B39',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7E7E7E',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  petThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  petThumbnailPlaceholder: {
    backgroundColor: '#FFF0EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawIcon: {
    fontSize: 28,
  },
  petInfoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  petCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  petCardBreed: {
    fontSize: 13,
    color: '#7E7E7E',
    marginTop: 2,
  },
  badgeWrapper: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeAvailable: {
    backgroundColor: '#E2F7E4',
  },
  badgeAvailableText: {
    color: '#28A745',
  },
  badgeUnavailable: {
    backgroundColor: '#FFF0EB',
  },
  badgeUnavailableText: {
    color: '#E07B39',
  },
  badgeAdoption: {
    backgroundColor: '#E8F4FD',
  },
  badgeAdoptionText: {
    color: '#007BFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D2D2D',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#7E7E7E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  logoutButton: {
    flexDirection: 'row',
    height: 52,
    width: '100%',
    backgroundColor: '#FFEBE5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD6C9',
  },
  logoutButtonText: {
    color: '#FF7A50',
    fontSize: 15,
    fontWeight: '700',
  },
  loaderContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 300,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: '#7E7E7E',
    fontWeight: '600',
  },
});
