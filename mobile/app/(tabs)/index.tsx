import { CreateDeckModal } from "@/components/dashboard/create-deck-modal";
import { DeckRowCard } from "@/components/dashboard/deck-row-card";
import { SummaryStatCard } from "@/components/dashboard/summary-stat-card";
import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import {
  buildStudyDelta,
  buildStudyStreak,
  DashboardService,
  DashboardSummary,
  DeckInsight,
  StudyHistoryEntry,
  pickDeckPreset,
  toDeckInsight,
} from "@/service/dashboard.service";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [history, setHistory] = useState<StudyHistoryEntry[]>([]);
  const [recentDecks, setRecentDecks] = useState<DeckInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [deckTitle, setDeckTitle] = useState("");
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, router, token]);

  const loadDashboard = useCallback(async (showRefresh = false) => {
    if (!token) {
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [summaryResponse, historyResponse, deckList] = await Promise.all([
        DashboardService.getSummary(token),
        DashboardService.getHistory(token),
        DashboardService.getDecks(token),
      ]);

      const recentDeckDetails = await Promise.all(
        deckList
          .slice(0, 3)
          .map((deck) => DashboardService.getDeckDetails(token, deck.id))
      );

      setSummary(summaryResponse);
      setHistory(historyResponse);
      setRecentDecks(recentDeckDetails.map(toDeckInsight));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar a dashboard.";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isFocused && token) {
      loadDashboard();
    }
  }, [isFocused, loadDashboard, token]);

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
      const preset = pickDeckPreset(trimmedTitle.length);
      await DashboardService.createDeck(token, {
        title: trimmedTitle,
        color: preset.color,
        icon: preset.icon,
      });

      setDeckTitle("");
      setIsCreateModalVisible(false);
      await loadDashboard();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel criar o deck.";
      Alert.alert("Erro", message);
    } finally {
      setIsCreatingDeck(false);
    }
  }

  const firstName = useMemo(
    () => user?.name?.trim().split(" ")[0] ?? "Usuario",
    [user?.name]
  );
  const streakDays = buildStudyStreak(history);
  const studyDelta = buildStudyDelta(history, summary?.cards_today ?? 0);
  const dailyGoal = Math.max(summary?.total_cards ?? 0, summary?.cards_today ?? 0, 0);
  const cardsProgressValue = dailyGoal
    ? `${summary?.cards_today ?? 0}/${dailyGoal}`
    : "0/0";

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

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={P.dark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>MemoRise</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, styles.disabledIconButton]}
            activeOpacity={1}
            disabled
          >
            <Ionicons name="notifications-outline" size={22} color={P.dark} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("./library")}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={22} color={P.dark} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.separator} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={P.primary}
          />
        }
      >
        <View>
          <Text style={styles.greeting} numberOfLines={1}>
            Olá, {firstName}!
          </Text>
          <Text style={styles.subGreeting} numberOfLines={1}>
            Pronto para sua sessao de estudos de hoje?
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryStatCard
            icon="cards-outline"
            iconLibrary="material"
            accent={P.accentGreen}
            label="Cards Estudados"
            value={cardsProgressValue}
            change={`${studyDelta >= 0 ? "+" : ""}${studyDelta}%`}
            iconColor={P.dark}
          />
          <SummaryStatCard
            icon="flame-outline"
            accent={P.accentGreenAlt}
            label="Ofensiva Atual"
            value={`${streakDays} Dias`}
            change={summary?.cards_today ? "+1" : "0"}
            iconColor={P.dark}
          />
        </View>

        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.85}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={22} color={P.white} />
          <Text style={styles.createButtonText}>Criar Novo Deck</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Decks Recentes</Text>
          <TouchableOpacity
            onPress={() => router.push("./library")}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionAction}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Carregando dashboard...</Text>
            <Text style={styles.emptyText}>
              Estamos organizando seus cards e metricas.
            </Text>
          </View>
        ) : recentDecks.length ? (
          <View style={styles.decksList}>
            {recentDecks.map((deck) => (
              <DeckRowCard
                key={deck.id}
                deck={deck}
                onPress={() => router.push("./library")}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum deck ainda</Text>
            <Text style={styles.emptyText}>
              Crie seu primeiro deck para comecar a acompanhar o progresso aqui.
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
  header: {
    height: 72,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledIconButton: {
    opacity: 0.95,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  separator: {
    height: 1,
    backgroundColor: P.stroke,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 32,
    gap: 24,
  },
  greeting: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: P.dark,
    marginBottom: 6,
  },
  subGreeting: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: P.primary,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 16,
  },
  createButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: P.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  createButtonText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: P.white,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  sectionAction: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: P.primary,
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
