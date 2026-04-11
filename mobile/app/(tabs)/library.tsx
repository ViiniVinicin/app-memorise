import { CreateDeckModal } from "@/components/dashboard/create-deck-modal";
import { DeckRowCard } from "@/components/dashboard/deck-row-card";
import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import {
  DashboardService,
  DeckInsight,
  pickDeckPreset,
  toDeckInsight,
} from "@/service/dashboard.service";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
  const { token, isLoading } = useAuth();
  const isFocused = useIsFocused();

  const [decks, setDecks] = useState<DeckInsight[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [deckTitle, setDeckTitle] = useState("");
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);

  const loadLibrary = useCallback(async (showRefresh = false) => {
    if (!token) {
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const deckList = await DashboardService.getDecks(token);
      const details = await Promise.all(
        deckList.map((deck) => DashboardService.getDeckDetails(token, deck.id))
      );

      setDecks(details.map(toDeckInsight));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar a biblioteca.";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && isFocused && token) {
      loadLibrary();
    }
  }, [isFocused, isLoading, loadLibrary, token]);

  async function handleCreateDeck() {
    if (!token) {
      return;
    }

    const trimmedTitle = deckTitle.trim();

    if (!trimmedTitle) {
      Alert.alert("Atencao", "Informe um titulo para o deck.");
      return;
    }

    setIsCreatingDeck(true);

    try {
      const preset = pickDeckPreset(trimmedTitle.length + decks.length);
      await DashboardService.createDeck(token, {
        title: trimmedTitle,
        color: preset.color,
        icon: preset.icon,
      });

      setDeckTitle("");
      setIsCreateModalVisible(false);
      await loadLibrary();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel criar o deck.";
      Alert.alert("Erro", message);
    } finally {
      setIsCreatingDeck(false);
    }
  }

  const filteredDecks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return decks;
    }

    return decks.filter((deck) => deck.title.toLowerCase().includes(normalizedSearch));
  }, [decks, search]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={P.background} />

      <CreateDeckModal
        visible={isCreateModalVisible}
        deckTitle={deckTitle}
        isSubmitting={isCreatingDeck}
        onChangeTitle={setDeckTitle}
        onClose={() => {
          setDeckTitle("");
          setIsCreateModalVisible(false);
        }}
        onSubmit={handleCreateDeck}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadLibrary(true)}
            tintColor={P.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Biblioteca</Text>
            <Text style={styles.subtitle}>
              {decks.length} deck{decks.length === 1 ? "" : "s"} disponiveis
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={22} color={P.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={P.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar decks"
            placeholderTextColor={P.textMuted}
            style={styles.searchInput}
          />
        </View>

        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Carregando biblioteca...</Text>
            <Text style={styles.emptyText}>
              Estamos buscando seus decks e organizando os ultimos estudos.
            </Text>
          </View>
        ) : filteredDecks.length ? (
          <View style={styles.decksList}>
            {filteredDecks.map((deck) => (
              <DeckRowCard
                key={deck.id}
                deck={deck}
                onPress={() =>
                  Alert.alert(
                    deck.title,
                    `${deck.totalCards} cards\n${deck.progress}% dominado\n${deck.dueCards} para revisar agora.`
                  )
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {decks.length ? "Nenhum deck encontrado" : "Biblioteca vazia"}
            </Text>
            <Text style={styles.emptyText}>
              {decks.length
                ? "Tente ajustar a busca para encontrar o deck desejado."
                : "Crie seu primeiro deck para comecar a montar sua biblioteca."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.background,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 34,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  subtitle: {
    fontSize: 15,
    color: P.textMuted,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: P.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.stroke,
    backgroundColor: P.whiteCardBright,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: P.dark,
  },
  decksList: {
    gap: 14,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: P.whiteCard,
    borderWidth: 1,
    borderColor: P.stroke,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: P.textMuted,
  },
});
