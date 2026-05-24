import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useSession from '../hooks/useSession';
import api from '../../utils/api';

export default function ProfileScreen({ myPets: myPetsFromHome = [] }) {
  const { user, logout } = useSession();
  const [profileUser, setProfileUser] = useState(user);
  const [activeSection, setActiveSection] = useState('mypets');
  const myPets = myPetsFromHome;
  const [myAdoptions, setMyAdoptions] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [loadingAdoptions, setLoadingAdoptions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const formatRegistrationDate = (dateString) => {
    if (!dateString) return 'Membro desde recente';
    try {
      const date = new Date(dateString);
      const formatted = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      return `Membro desde ${formatted}`;
    } catch (e) {
      return 'Membro desde recente';
    }
  };

  const getUserInitials = (name) => {
    if (!name) return '🐾';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fetchUserProfile = async () => {
    try {
      const data = await api.checkUser();
      if (data) setProfileUser(data);
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err);
    }
  };

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

  const fetchMyAdoptions = async (showLoader = true) => {
    if (showLoader) setLoadingAdoptions(true);
    try {
      const data = await api.getMyAdoptions();
      setMyAdoptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar minhas adoções:', err);
      throw err;
    } finally {
      if (showLoader) setLoadingAdoptions(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchMyAdoptions().catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserProfile(),
      fetchMyAdoptions(false).catch(() => {}),
    ]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza de que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  const resolvePet = (item) => {
    if (activeSection === 'myadoptions' && item.pet && typeof item.pet === 'object') {
      return { pet: item.pet, status: item.status || 'pending' };
    }
    return { pet: item, status: item.available !== false ? 'available' : 'unavailable' };
  };

  const resolveImage = (pet) => {
    if (Array.isArray(pet.images) && pet.images.length > 0) return pet.images[0];
    if (typeof pet.image === 'string' && pet.image.length > 0) return pet.image;
    return null;
  };

  const badgeForStatus = (status) => {
    const map = {
      available:   { bg: '#E2F7E4', color: '#28A745', label: 'Disponível' },
      unavailable: { bg: '#FFF0EB', color: '#E07B39', label: 'Adotado / Inativo' },
      pending:     { bg: '#FFF9E5', color: '#D4A017', label: 'Aguardando' },
      approved:    { bg: '#E2F7E4', color: '#28A745', label: 'Aprovada' },
      rejected:    { bg: '#FFEBEE', color: '#E53935', label: 'Recusada' },
    };
    return map[status] || { bg: '#E8F4FD', color: '#007BFF', label: 'Em andamento' };
  };

  const renderPetItem = ({ item }) => {
    const { pet, status } = resolvePet(item);
    const imageUri = resolveImage(pet);
    const badge = badgeForStatus(status);

    return (
      <View style={styles.petCard}>
        {/* Topo */}
        <View style={styles.petInfoTop}>
          <View>
            <Text style={styles.infoLabel}>Distância</Text>
            <Text style={styles.infoValue}>{pet.distance || '—'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {/* Imagem */}
        <View style={styles.imageWrapper}>
          <View style={styles.imageBackground} />
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.petImage} />
          ) : (
            <View style={[styles.petImage, styles.petImagePlaceholder]}>
              <Text style={{ fontSize: 28 }}>🐾</Text>
            </View>
          )}
        </View>

        {/* Rodapé */}
        <View style={styles.petFooter}>
          <Text style={styles.petName}>{pet.name || 'Sem nome'}</Text>
          <Text style={styles.petBreed} numberOfLines={2}>{pet.breed || 'Raça não definida'}</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{getUserInitials(profileUser?.name)}</Text>
        </View>
        <Text style={styles.profileName}>{profileUser?.name || 'Usuário Pawfect'}</Text>
        <Text style={styles.profileEmail}>{profileUser?.email || 'email@exemplo.com'}</Text>
        <Text style={styles.registrationDate}>{formatRegistrationDate(profileUser?.createdAt)}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        {[
          { icon: 'person-outline', label: 'Nome Completo',      value: profileUser?.name },
          { icon: 'mail-outline',   label: 'E-mail',             value: profileUser?.email },
          { icon: 'call-outline',   label: 'Telefone / Contato', value: profileUser?.phone },
        ].map(({ icon, label, value }) => (
          <View key={label} style={styles.infoRow}>
            <Ionicons name={icon} size={20} color="#E07B39" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoRowLabel}>{label}</Text>
              <Text style={styles.infoRowValue}>{value || 'Não cadastrado'}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveSection('mypets')}
          style={[styles.tabButton, activeSection === 'mypets' && styles.tabButtonActive]}
        >
          <Ionicons name="paw-outline" size={18} color={activeSection === 'mypets' ? '#FFFFFF' : '#7E7E7E'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabButtonText, activeSection === 'mypets' && styles.tabButtonTextActive]}>
            Meus Pets ({myPets.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSection('myadoptions')}
          style={[styles.tabButton, activeSection === 'myadoptions' && styles.tabButtonActive]}
        >
          <Ionicons name="heart-outline" size={18} color={activeSection === 'myadoptions' ? '#FFFFFF' : '#7E7E7E'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabButtonText, activeSection === 'myadoptions' && styles.tabButtonTextActive]}>
            Minhas Adoções ({myAdoptions.length})
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color="#FF7A50" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </Pressable>
    </View>
  );

  const renderEmptyState = () => {
    const isPets = activeSection === 'mypets';
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Text style={{ fontSize: 28 }}>{isPets ? '🐾' : '❤️'}</Text>
        </View>
        <Text style={styles.emptyTitle}>{isPets ? 'Nenhum pet cadastrado' : 'Nenhuma adoção solicitada'}</Text>
        <Text style={styles.emptySubtitle}>
          {isPets
            ? 'Você ainda não cadastrou nenhum pet para adoção na plataforma.'
            : 'Explore os animais disponíveis e agende uma visita para adotar um novo amigo!'}
        </Text>
      </View>
    );
  };

  const currentList = activeSection === 'mypets' ? myPets : myAdoptions;
  const isLoading   = activeSection === 'mypets' ? loadingPets : loadingAdoptions;

  return (
    <View style={styles.container}>
      <FlatList
        data={isLoading ? [] : currentList}
        renderItem={renderPetItem}
        keyExtractor={(item) => String(item._id || item.id || Math.random())}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 110 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  headerContainer: { alignItems: 'center', width: '100%' },

  profileCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 24,
    paddingHorizontal: 20, alignItems: 'center', width: '100%',
    shadowColor: '#2D2D2D', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    borderWidth: 1, borderColor: '#EFEFEF', marginBottom: 20,
  },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: '#FFF0EB',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    borderWidth: 2, borderColor: '#FFF0EB',
  },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: '#E07B39' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#2D2D2D', textAlign: 'center' },
  profileEmail: { fontSize: 14, color: '#7E7E7E', marginTop: 4, textAlign: 'center' },
  registrationDate: { fontSize: 12, color: '#A0A0A0', marginTop: 8, fontWeight: '600' },

  infoCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, width: '100%',
    shadowColor: '#2D2D2D', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    borderWidth: 1, borderColor: '#EFEFEF', marginBottom: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#2D2D2D', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIcon: { marginRight: 16, width: 24, textAlign: 'center' },
  infoRowLabel: { fontSize: 12, color: '#7E7E7E', fontWeight: '600' },
  infoRowValue: { fontSize: 15, fontWeight: '700', color: '#2D2D2D', marginTop: 2 },

  tabContainer: {
    flexDirection: 'row', backgroundColor: '#F3EFE9', borderRadius: 14,
    padding: 4, width: '100%', marginBottom: 20,
  },
  tabButton: { flex: 1, flexDirection: 'row', height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tabButtonActive: { backgroundColor: '#E07B39' },
  tabButtonText: { fontSize: 12, fontWeight: '700', color: '#7E7E7E' },
  tabButtonTextActive: { color: '#FFFFFF' },

  // ── Pet card estilo HomeScreen ─────────────────────────────────────────────
  petCard: {
    width: '48%',
    borderRadius: 24,
    padding: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  petInfoTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8,
  },
  infoLabel: { fontSize: 10, fontWeight: '700', color: '#2D2D2D', marginBottom: 2 },
  infoValue: { fontSize: 10, color: '#8B8B8B' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 9, fontWeight: '700' },

  imageWrapper: { height: 130, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 },
  imageBackground: {
    position: 'absolute', width: '85%', height: '95%',
    backgroundColor: '#F4A940',
    borderTopLeftRadius: 100, borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    right: 0, bottom: 0,
  },
  petImage: {
    position: 'absolute', right: 4, bottom: 4, width: '82%', height: '92%',
    borderTopLeftRadius: 100, borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    resizeMode: 'cover',
  },
  petImagePlaceholder: { backgroundColor: '#FFF0EB', justifyContent: 'center', alignItems: 'center' },

  petFooter: { backgroundColor: '#F4A940', borderRadius: 14, padding: 10, minHeight: 56 },
  petName: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  petBreed: { fontSize: 10, color: '#6B4F2A', marginTop: 2 },

  emptyContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, width: '100%' },
  emptyIconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#EFEFEF', justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#2D2D2D', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#7E7E7E', textAlign: 'center', marginTop: 6, lineHeight: 18 },

  footerContainer: { alignItems: 'center', marginTop: 12, width: '100%' },
  logoutButton: {
    flexDirection: 'row', height: 52, width: '100%', backgroundColor: '#FFEBE5',
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD6C9',
  },
  logoutButtonText: { color: '#FF7A50', fontSize: 15, fontWeight: '700' },

  loaderContainer: { position: 'absolute', left: 0, right: 0, top: 300, alignItems: 'center' },
  loaderText: { marginTop: 10, fontSize: 13, color: '#7E7E7E', fontWeight: '600' },
});