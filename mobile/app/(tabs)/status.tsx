import { SummaryStatCard } from "@/components/dashboard/summary-stat-card";
import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import {
  buildStudyDelta,
  buildStudyStreak,
  DashboardService,
  DashboardSummary,
  StudyHistoryEntry,
} from "@/service/dashboard.service";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatHistoryDate(date: string) {
  const value = new Date(date);
  const months = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  return `${String(value.getDate()).padStart(2, "0")} ${months[value.getMonth()]}`;
}

export default function StatusScreen() {
  const { token } = useAuth();
  const isFocused = useIsFocused();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [history, setHistory] = useState<StudyHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = useCallback(async (showRefresh = false) => {
    if (!token) {
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [summaryResponse, historyResponse] = await Promise.all([
        DashboardService.getSummary(token),
        DashboardService.getHistory(token),
      ]);

      setSummary(summaryResponse);
      setHistory(historyResponse);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar os status.";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isFocused && token) {
      loadStatus();
    }
  }, [isFocused, loadStatus, token]);

  const streakDays = buildStudyStreak(history);
  const studyDelta = buildStudyDelta(history, summary?.cards_today ?? 0);
  const orderedHistory = useMemo(
    () =>
      [...history].sort(
        (first, second) =>
          new Date(second.study_date).getTime() - new Date(first.study_date).getTime()
      ),
    [history]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={P.background} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadStatus(true)}
            tintColor={P.primary}
          />
        }
      >
        <View>
          <Text style={styles.title}>Status</Text>
          <Text style={styles.subtitle}>Seu panorama rapido de estudos</Text>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryStatCard
            icon="today-outline"
            accent={P.primary}
            label="Hoje"
            value={`${summary?.cards_today ?? 0} cards`}
            change={`${studyDelta >= 0 ? "+" : ""}${studyDelta}%`}
          />
          <SummaryStatCard
            icon="flame-outline"
            accent={P.warningAlt}
            label="Sequencia"
            value={`${streakDays} Dias`}
            change={summary?.cards_today ? "+1" : "0"}
          />
        </View>

        <View style={styles.summaryGrid}>
          <SummaryStatCard
            icon="albums-outline"
            accent={P.success}
            label="Decks"
            value={`${summary?.total_decks ?? 0}`}
            change="ativos"
          />
          <SummaryStatCard
            icon="time-outline"
            accent={P.info}
            label="Pendentes"
            value={`${summary?.pending_cards ?? 0}`}
            change="agora"
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Ultimos registros</Text>

          {loading ? (
            <Text style={styles.panelText}>Carregando seu historico...</Text>
          ) : orderedHistory.length ? (
            <View style={styles.historyList}>
              {orderedHistory.map((entry) => (
                <View key={entry.id} style={styles.historyRow}>
                  <View>
                    <Text style={styles.historyDate}>
                      {formatHistoryDate(entry.study_date)}
                    </Text>
                    <Text style={styles.historyMeta}>Sessao registrada</Text>
                  </View>
                  <Text style={styles.historyValue}>
                    {entry.cards_reviewed} cards
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.panelText}>
              Assim que voce revisar cards, o historico diario vai aparecer aqui.
            </Text>
          )}
        </View>
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
    gap: 18,
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
  summaryGrid: {
    flexDirection: "row",
    gap: 16,
  },
  panel: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: P.whiteCard,
    borderWidth: 1,
    borderColor: P.stroke,
    gap: 14,
  },
  panelTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
    color: P.textMuted,
  },
  historyList: {
    gap: 14,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 14,
    backgroundColor: P.darkGhost,
  },
  historyDate: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  historyMeta: {
    fontSize: 13,
    color: P.textMuted,
    marginTop: 2,
  },
  historyValue: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
    color: P.primary,
  },
});
