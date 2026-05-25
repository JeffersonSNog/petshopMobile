import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';

import api from '../../utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

/**
 * PetDetailScreen
 *
 * Props:
 *  - petId   {string}   ID do pet a exibir
 *  - onBack  {function} Callback para voltar
 */
export function PetDetailScreen({ petId, onBack }) {
  const [pet, setPet]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  const handleAdoption = async () => {
    try {
      await api.scheduleAdoption(petId);

      Alert.alert(
      "Adoção solicitada",
      "Sua solicitação foi enviada com sucesso!"
    );

    } catch (err) {
      console.log(err);

      Alert.alert(
        "Não foi possível adotar",
        err.message || "Tente novamente mais tarde."
      );
    };
  };
 

  // ─── Buscar pet ──────────────────────────────────────────────────────────────
  const fetchPet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://petadopt.onrender.com/pet/${petId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}`);
      }
      console.log('Pet carregado:', JSON.stringify(data, null, 2));
      setPet(data.pet ?? data);
    } catch (err) {
      console.error('Erro ao buscar pet:', err);
      setError(err.message || 'Não foi possível carregar o pet.');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const genderLabel = (g) => {
    if (!g) return null;
    return g.toLowerCase() === 'male' ? '♂ Macho' : '♀ Fêmea';
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#E07B39" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  // ─── Erro ────────────────────────────────────────────────────────────────────
  if (error || !pet) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorEmoji}>😿</Text>
        <Text style={styles.errorText}>{error || 'Pet não encontrado.'}</Text>
        <Pressable style={styles.retryButton} onPress={fetchPet}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
        {onBack && (
          <Pressable style={styles.backButtonFlat} onPress={onBack}>
            <Text style={styles.backButtonFlatText}>← Voltar</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  // ─── Dados ───────────────────────────────────────────────────────────────────
  // A imagem pode estar em pet.images[] ou em pet.category.image
  const categoryImage = pet.category?.image ?? null;
  const images = Array.isArray(pet.images) && pet.images.length > 0
    ? pet.images
    : categoryImage ? [categoryImage] : [];
  const hasImage = images.length > 0;
  const gender   = genderLabel(pet.gender);
  const isAdopted = pet?.adopter != null;
  const petStatusText = isAdopted 
  ? '🔴 Adoção solicitada'
  : '🟢 Disponível';

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── Imagem ── */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <>
              <Image
                source={{ uri: images[currentImage] }}
                style={styles.image}
                resizeMode="cover"
              />
              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailStrip}
                  contentContainerStyle={styles.thumbnailContent}
                >
                  {images.map((uri, idx) => (
                    <Pressable key={idx} onPress={() => setCurrentImage(idx)}>
                      <Image
                        source={{ uri }}
                        style={[
                          styles.thumbnail,
                          idx === currentImage && styles.thumbnailActive,
                        ]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderEmoji}>🐾</Text>
              <Text style={styles.imagePlaceholderText}>Sem foto disponível</Text>
            </View>
          )}

          {/* Botão voltar */}
          {onBack && (
            <Pressable style={styles.backOverlay} onPress={onBack}>
              <Text style={styles.backOverlayText}>‹</Text>
            </Pressable>
          )}

          {/* Badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, pet.available ? styles.badgeAvailable : styles.badgeUnavailable]}>
              <Text style={styles.badgeText}>{pet.available ? 'Disponível' : 'Indisponível'}</Text>
            </View>
            {pet.isVerified && (
              <View style={[styles.badge, styles.badgeVerified]}>
                <Text style={styles.badgeText}>✓ Verificado</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Card de informações ── */}
        <View style={styles.card}>

          {/* Nome + gênero */}
          <View style={styles.nameRow}>
            <Text style={styles.petName}>{pet.name ?? '—'}</Text>
            {gender && <Text style={styles.petGender}>{gender}</Text>}
          </View>

          <Text
            style={{
              color: isAdopted ? '#E53935' : '#28A745',
              fontWeight: '700',
              marginBottom: 10,
            }}
            >
            {petStatusText}
          </Text>

          {/* Raça */}
          {pet.breed ? (
            <Text style={styles.petBreed}>{pet.breed}</Text>
          ) : null}

          {/* Stats: idade, peso, cor */}
          <View style={styles.statsRow}>
            {pet.age != null && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{pet.age}</Text>
                <Text style={styles.statLabel}>anos</Text>
              </View>
            )}
            {pet.weight != null && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{pet.weight}</Text>
                <Text style={styles.statLabel}>kg</Text>
              </View>
            )}
            {pet.color ? (
              <View style={styles.statBox}>
                <Text style={styles.statValue} numberOfLines={1}>{pet.color}</Text>
                <Text style={styles.statLabel}>cor</Text>
              </View>
            ) : null}
          </View>

          {/* História */}
          {pet.story ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre o pet</Text>
              <Text style={styles.storyText}>{pet.story}</Text>
            </View>
          ) : null}

          {/* Responsável */}
          {pet.user && typeof pet.user === 'object' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Responsável</Text>
              <View style={styles.ownerCard}>
                <View style={styles.ownerAvatar}>
                  <Text style={styles.ownerAvatarText}>
                    {(pet.user.name || '?')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ownerName}>{pet.user.name}</Text>
                  {pet.user.phone && <Text style={styles.ownerInfo}>📞 {pet.user.phone}</Text>}
                  {pet.user.email && <Text style={styles.ownerInfo}>✉️ {pet.user.email}</Text>}
                </View>
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── Botão Adotar ── */}
      <View style={styles.footer}>
        <Pressable
          disabled={isAdopted}
          onPress={handleAdoption}
          style={({ pressed }) => [
            styles.adoptButton,
            isAdopted && { opacity: 0.6 },
            pressed && !isAdopted && styles.adoptButtonPressed,
          ]}
        >
          <Text style={styles.adoptButtonText}>
            {isAdopted
            ? '✅ Adoção solicitada'
            : '🐾 Adotar pet'}
            </Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  scrollContent: {
    paddingBottom: 110,
  },

  // Centralizados (loading / erro)
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
    padding: 24,
    gap: 12,
  },
  loadingText: { color: '#888', fontSize: 15 },
  errorEmoji:  { fontSize: 48 },
  errorText:   { color: '#555', fontSize: 15, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#E07B39',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText:   { color: '#FFF', fontWeight: '700', fontSize: 15 },
  backButtonFlat:    { marginTop: 4 },
  backButtonFlatText:{ color: '#E07B39', fontSize: 15, fontWeight: '600' },

  // Imagem
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: '#F0EDE8',
  },
  image: { width: '100%', height: IMAGE_HEIGHT },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderEmoji: { fontSize: 56, marginBottom: 8 },
  imagePlaceholderText:  { color: '#AAAAAA', fontSize: 14 },

  thumbnailStrip: { position: 'absolute', bottom: 8, left: 0, right: 0 },
  thumbnailContent: { paddingHorizontal: 12, gap: 8 },
  thumbnail: {
    width: 52, height: 52, borderRadius: 8,
    borderWidth: 2, borderColor: 'transparent',
  },
  thumbnailActive: { borderColor: '#E07B39' },

  backOverlay: {
    position: 'absolute', top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  backOverlayText: { color: '#FFF', fontSize: 28, lineHeight: 32, fontWeight: '300' },

  badgeRow: {
    position: 'absolute', top: 16, right: 16,
    flexDirection: 'column', gap: 6, alignItems: 'flex-end',
  },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeAvailable:   { backgroundColor: '#27AE60' },
  badgeUnavailable: { backgroundColor: '#E74C3C' },
  badgeVerified:    { backgroundColor: '#2980B9' },
  badgeText:        { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // Card principal
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 24,
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  petName:   { fontSize: 26, fontWeight: '800', color: '#2D2D2D', letterSpacing: -0.5, flexShrink: 1 },
  petGender: { fontSize: 16, color: '#E07B39', fontWeight: '600', marginLeft: 8 },
  petBreed:  { fontSize: 15, color: '#888', marginBottom: 20 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: '#FFF5F0',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#FAE0D4',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#E07B39' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  section:      { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  storyText:    { fontSize: 15, color: '#444', lineHeight: 22 },

  ownerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFAFA', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#EFEFEF', gap: 14,
  },
  ownerAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#FFF0EB', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#E07B39',
  },
  ownerAvatarText: { fontSize: 20, fontWeight: '700', color: '#E07B39' },
  ownerName:       { fontSize: 15, fontWeight: '700', color: '#2D2D2D', marginBottom: 2 },
  ownerInfo:       { fontSize: 13, color: '#666', marginBottom: 1 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 24, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#EFEFEF',
  },
  adoptButton: {
    height: 54, backgroundColor: '#E07B39',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#E07B39', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  adoptButtonPressed: { backgroundColor: '#C56223', transform: [{ scale: 0.98 }] },
  adoptButtonText:    { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});

export default PetDetailScreen;