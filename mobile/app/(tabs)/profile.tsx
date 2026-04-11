import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { DashboardService, DashboardSummary } from "@/service/dashboard.service";
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfileSummary = useCallback(async (showRefresh = false) => {
    if (!token) {
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    }

    try {
      const summaryResponse = await DashboardService.getSummary(token);
      setSummary(summaryResponse);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel atualizar o perfil.";
      Alert.alert("Erro", message);
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isFocused && token) {
      loadProfileSummary();
    }
  }, [isFocused, loadProfileSummary, token]);

  const initials = useMemo(() => {
    const names = user?.name?.trim().split(" ").filter(Boolean) ?? ["U"];
    return names
      .slice(0, 2)
      .map((name) => name[0]?.toUpperCase())
      .join("");
  }, [user?.name]);

  async function handleLogout() {
    Alert.alert("Sair", "Deseja realmente encerrar sua sessao?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={P.background} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProfileSummary(true)}
            tintColor={P.primary}
          />
        }
      >
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{user?.name ?? "Usuario"}</Text>
          <Text style={styles.email}>{user?.email ?? "Sem email"}</Text>

          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{summary?.total_decks ?? 0}</Text>
              <Text style={styles.quickStatLabel}>Decks</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{summary?.total_cards ?? 0}</Text>
              <Text style={styles.quickStatLabel}>Cards</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{summary?.pending_cards ?? 0}</Text>
              <Text style={styles.quickStatLabel}>Pendentes</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Informacoes da conta</Text>
          <InfoRow label="Perfil" value={user?.role ?? "user"} />
          <InfoRow
            label="Tema escuro"
            value={user?.dark_theme ? "Ativado" : "Desativado"}
          />
          <InfoRow label="Status" value="Conta ativa" />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color={P.white} />
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 34,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    backgroundColor: P.whiteCardMedium,
    borderWidth: 1,
    borderColor: P.stroke,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: P.dark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: P.white,
  },
  name: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  email: {
    fontSize: 14,
    color: P.textMuted,
    marginTop: 4,
    marginBottom: 18,
  },
  quickStats: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  quickStatItem: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: P.darkFaint,
  },
  quickStatValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  quickStatLabel: {
    fontSize: 13,
    color: P.textMuted,
    marginTop: 4,
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: P.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    color: P.dark,
  },
  logoutButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: P.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: P.white,
  },
});
