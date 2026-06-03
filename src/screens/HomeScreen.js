import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from './ProfileScreen';
import { PetDetailScreen } from './PetDetailScreen';
import useSession from '../hooks/useSession';
import api from '../../service/api';

const pet_categories = [
  { id: 1, title: 'Dog',   emoji: '🐶', active: false },
  { id: 2, title: 'Cat',   emoji: '🐱', active: true  },
  { id: 3, title: 'Birds', emoji: '🦜', active: false },
  { id: 4, title: 'Fish',  emoji: '🐠', active: false },
];
 
const INITIAL_PETS = [
  {
    id: 1,
    name: 'Neko',
    breed: 'Scottish Fold · Kitten · Female',
    price: '$820',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop',
    isOwn: false,
  },
  {
    id: 2,
    name: 'Milo',
    breed: 'Orange Cat · Male',
    price: '$760',
    image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=800&auto=format&fit=crop',
    isOwn: false,
  },
];
 
// ─── Simulated backend ───────────────────────────────────────────────────────
const fakePostPet = (pet) =>
  new Promise((resolve) => setTimeout(() => resolve({ ok: true, id: pet._id }), 1400));
 
// ─── Empty-form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', breed: '', image: '' };
 
export function HomeScreen() {
  const [activeTab, setActiveTab]   = useState('home');
  const { user, logout } = useSession();
  const [userProfile, setUserProfile] = useState(user);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [pets, setPets]             = useState(INITIAL_PETS);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [sending, setSending]       = useState(false);
  const [formError, setFormError]   = useState('');
  const [selectedPetId, setSelectedPetId] = useState(null);

  // ── Filtro por cor ────────────────────────────────────────────────────────
  const filteredPets = pets.filter((pet) =>
    pet.color?.toLowerCase().includes(searchText.toLowerCase())
  );
 
  const fetchUserProfile = async () => {
    try {
      const data = await api.checkUser();
      if (data) setUserProfile(data);
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err);
    }
  };

  const fetchCategories = async () => {
    try{
      const data = await api.getCategories();
      if (data?.categories) {
        const categoriasFormatadas = data.categories.map((item) => ({
          id: item._id,
          title: item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase(),
          emoji: '🐾',
          active: false,
          image: item.image
        }));
        
        setCategories(categoriasFormatadas);
      }
    } catch (err) {
      console.log('erro ao buscar as categorias: ', err);
    }
  }

  const handleSelectCategory = (id) => {
    setSelectedCategoryIds((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((itemIds) => itemIds !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const fetchPets = async () => {
    try {
      const data = await api.getPets();
      if (data?.pets) {
        setPets(data.pets);
      }
    } 
    catch (err) {
      console.log('erro ao buscar os pets: ', err);
    }
  }

  // ── #22 + #23: add pet form & send to backend ──────────────────────────────
  const handleOpenForm = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModalVisible(true);
  };
 
  const handleSubmitPet = async () => {
    if (!form.name.trim() || !form.breed.trim()) {
      setFormError('Por favor, preencha nome e raça.');
      return;
    }
 
    const newPet = {
      id: Date.now(),
      name: form.name.trim(),
      breed: form.breed.trim(),
      image:
        form.image.trim() ||
        'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=800&auto=format&fit=crop',
      isOwn: true,
    };
 
    setSending(true);
    setFormError('');
    try {
      await fakePostPet(newPet);
      setPets((prev) => [...prev, newPet]);
      setModalVisible(false);
    } catch {
      setFormError('Erro ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };
 
  // ── #24 + #25: remove button & confirmation ────────────────────────────────
  const handleRemovePet = (petId, petName) => {
    Alert.alert(
      'Remover pet',
      `Tem certeza que deseja remover "${petName}" da lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setPets((prev) => prev.filter((p) => p.id !== petId));
          },
        },
      ]
    );
  };
 
  useEffect(() => {
      fetchUserProfile();
      fetchCategories();
      fetchPets();
      console.log('atualizou !');
  }, []);

  // ── Navegar para detalhe do pet ───────────────────────────────────────────
  if (selectedPetId) {
    return (
      <PetDetailScreen
        petId={selectedPetId}
        onBack={() => setSelectedPetId(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
 
        {activeTab === 'home' ? (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                {user.name ? <Text style={styles.greeting}>Olá, {user.name} 👋🏻</Text> : <Text style={styles.greeting}>Hi, User 👋🏻</Text>}
                <Text style={styles.subtitle}>Aproveite o nosso app</Text>
              </View>
              <Pressable style={styles.notificationButton}>
                <Ionicons name="notifications-outline" style={styles.notificationIcon} />
              </Pressable>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" style={styles.searchIcon} />
                <TextInput
                  placeholder="Filtre pela cor..."
                  placeholderTextColor="#9B9B9B"
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
            </View>

            {/* Categories */}
            <View>
              <Text style={styles.sectionTitle}>Categorias</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((item) => {
                const isSelected = selectedCategoryIds.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectCategory(item.id)} 
                    style={[styles.categoryCard, isSelected && styles.categoryCardActive]} 
                  >
                    <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                      {item.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
 
            {/* Pet Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
            >
              {filteredPets.map((pet) => (
                <Pressable
                  key={pet._id ?? pet.id}
                  style={styles.petCard}
                  onPress={() => setSelectedPetId(pet._id ?? pet.id)}
                >
                  <View style={styles.petInfoTop}>
                    <View>
                      <Text style={styles.sectionTitle}>Sobre</Text>
                      <Text style={styles.tagText}>{pet.color}</Text>
                      <Text style={styles.tagText}>{pet.age != null ? (pet.age === 1 ? '1 ano' : `${pet.age} anos`) : '—'}</Text>
                      <Text style={styles.tagText}>{pet.weight} kg</Text>
                      <Text style={styles.tagText}>{pet.category}</Text>
                    </View>
                  </View>
 
                  <View style={styles.imageWrapper}>
                    <View style={styles.imageBackground} />
                    <Image source={{ uri: pet.images?.[0] }} style={styles.petImage} />
 
                    {pet.isOwn && (
                      <Pressable
                        style={styles.removeButton}
                        onPress={() => handleRemovePet(pet._id ?? pet.id, pet.name)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                      </Pressable>
                    )}
                  </View>
 
                  <View style={styles.petFooter}>
                    <View>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petBreed}>{pet.breed}</Text>
                    </View>
                    <Text style={styles.petPrice}>{pet.price}</Text>
                  </View>
 
                </Pressable>
              ))}
 
              {/* #22 – card para adicionar novo pet */}
              <Pressable style={styles.addCard} onPress={handleOpenForm}>
                <View style={styles.addIconCircle}>
                  <Ionicons name="add" size={36} color="#F4A940" />
                </View>
                <Text style={styles.addCardText}>Adicionar{'\n'}meu pet</Text>
              </Pressable>
            </ScrollView>
          </>
        ) : activeTab === 'profile' ? (
          <ProfileScreen myPets={pets.filter((p) => p.isOwn)} />
        ) : null}
 
        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          {[
            { key: 'home',      icon: 'home-outline' },
            { key: 'profile',   icon: 'person-outline' },
          ].map(({ key, icon }) => (
            <Pressable
              key={key}
              onPress={() => setActiveTab(key)}
              style={[styles.navButton, activeTab === key && styles.navButtonActive]}
            >
              <Ionicons name={icon} size={25} color={activeTab === key ? '#FFFFFF' : '#2D2D2D'} />
            </Pressable>
          ))}
        </View>
      </View>
 
      {/* ── #22 / #23 – Modal: formulário para adicionar pet ─────────────── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
 
            {/* Handle */}
            <View style={styles.modalHandle} />
 
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar meu pet</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#2D2D2D" />
              </Pressable>
            </View>
 
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { field: 'name',     label: 'Nome *',            placeholder: 'Ex: Luna' },
                { field: 'breed',    label: 'Raça / detalhes *', placeholder: 'Ex: Persa · Adulto · Fêmea' },
                { field: 'image',    label: 'URL da imagem',     placeholder: 'https://...' },
              ].map(({ field, label, placeholder }) => (
                <View key={field} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder={placeholder}
                    placeholderTextColor="#BBBBBB"
                    value={form[field]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                    autoCapitalize="none"
                  />
                </View>
              ))}
 
              {!!formError && <Text style={styles.formError}>{formError}</Text>}
 
              <Pressable
                style={[styles.submitButton, sending && styles.submitButtonDisabled]}
                onPress={handleSubmitPet}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>Enviar para o backend</Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
 
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
 
  // ── Header ────────────────────────────────────────────────────────────────
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#292929' },
  subtitle: { marginTop: 4, color: '#242424', fontSize: 14 },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF' },
  notificationIcon: { fontSize: 24 },
 
  // ── Search ────────────────────────────────────────────────────────────────
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  searchInputContainer: { flex: 1, height: 50, borderRadius: 90, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EFEFEF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginRight: 12 },
  searchIcon: { marginRight: 8, fontSize: 20 },
  searchInput: { flex: 1, color: '#1F1F1F', fontSize: 16 },
  filterButton: { width: 50, height: 50, borderRadius: 90, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EFEFEF', justifyContent: 'center', alignItems: 'center' },
  filterIcon: { fontSize: 24 },
  
  // ── Categories ────────────────────────────────────────────────────────────
  categoriesContainer: { paddingBottom: 16 },
  categoryCard: { width: 82, height: 110, borderRadius: 60, backgroundColor: '#F7F7F7', marginRight: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EFEFEF' },
  categoryCardActive: { backgroundColor: '#F4A940', borderColor: '#F4A940' },
  categoryEmoji: { fontSize: 28, marginBottom: 8 },
  categoryText: { color: '#2D2D2D', fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
 
  // ── Cards ─────────────────────────────────────────────────────────────────
  cardsContainer: { alignSelf: 'flex-start', paddingBottom: 24, alignItems: 'flex-start' },
  petCard: { width: 320, borderRadius: 32, padding: 20, backgroundColor: '#FFFFFF', marginRight: 16 },
  petInfoTop: { flexDirection: 'column', justifyContent: 'space-between', marginBottom: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#2D2D2D', marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: '#8B8B8B' },
  tagText: { fontSize: 12, color: '#8B8B8B', marginBottom: 2 },
 
  imageWrapper: { height: 190, justifyContent: 'flex-start', alignItems: 'center', marginBottom: 5 },
  imageBackground: { position: 'absolute', width: 220, height: 300, backgroundColor: '#F4A940', borderTopLeftRadius: 160, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, right: 0, bottom: 0 },
  petImage: { position: 'absolute', right: 5, bottom: 5, width: 210, height: 290, borderTopLeftRadius: 160, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, resizeMode: 'cover' },
 
  removeButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
 
  petFooter: { backgroundColor: '#F4A940', height: 100, padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  petName: { fontSize: 24, fontWeight: '400', color: '#1F1F1F' },
  petBreed: { marginTop: 4, fontSize: 12, color: '#8B8B8B', maxWidth: 160 },
  petPrice: { fontSize: 24, fontWeight: '400', color: '#FFFFFF' },
 
  addCard: {
    width: 160,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#F4A940',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  addIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F4A940',
    textAlign: 'center',
    lineHeight: 20,
  },
 
  // ── Bottom Navigation ─────────────────────────────────────────────────────
  bottomNavigation: { position: 'absolute', bottom: 24, left: 20, right: 20, height: 72, borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  navButton: { width: 64, height: 64, borderRadius: 90, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 4, borderColor: '#EEEEEE', marginHorizontal: 1 },
  navButtonActive: { backgroundColor: '#F4A940', borderColor: '#F4A940' },
 
  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 48, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDDDDD', alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#292929' },
 
  // ── Form ──────────────────────────────────────────────────────────────────
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#2D2D2D', marginBottom: 6 },
  fieldInput: { height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: '#EEEEEE', paddingHorizontal: 14, fontSize: 15, color: '#1F1F1F', backgroundColor: '#FAFAFA' },
  formError: { color: '#E53935', fontSize: 13, marginBottom: 12, textAlign: 'center' },
 
  submitButton: {
    height: 54,
    borderRadius: 90,
    backgroundColor: '#F4A940',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});