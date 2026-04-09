import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
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
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.background} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="book-outline" size={22} color={P.dark} />
            <Text style={styles.logoText}>MemoRise</Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color={P.primary} />
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          <View style={styles.welcomeCard}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={P.primary}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.welcomeTitle}>
              Olá, {user?.name?.split(" ")[0]}! 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Login realizado com sucesso.
            </Text>
            <Text style={styles.welcomeEmail}>{user?.email}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informações da conta</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Perfil</Text>
              <Text style={styles.infoValue}>{user?.role}</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 80,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  welcomeCard: {
    backgroundColor: P.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: P.stroke,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: P.dark,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: P.textMuted,
    marginBottom: 4,
  },
  welcomeEmail: {
    fontSize: 13,
    color: P.primary,
    fontFamily: Fonts.semibold,
  },
  infoCard: {
    backgroundColor: P.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: P.stroke,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: P.dark,
    marginBottom: 4,
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
});
