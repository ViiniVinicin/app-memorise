import { InputField } from "@/components/ui/input-field";
import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import {
  Lexend_400Regular,
  Lexend_600SemiBold,
  Lexend_700Bold,
  useFonts,
} from "@expo-google-fonts/lexend";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function OrDivider({ label = "OU" }: { label?: string }) {
  return (
    <View style={orStyles.row}>
      <View style={orStyles.line} />
      <Text style={orStyles.text}>{label}</Text>
      <View style={orStyles.line} />
    </View>
  );
}

const orStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: P.stroke },
  text: {
    marginHorizontal: 12,
    fontSize: 13,
    fontFamily: Fonts.semibold,
    color: P.textMuted,
  },
});

export default function LoginScreen() {
  const { login, token, isLoading: authLoading } = useAuth();
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useFonts({
    Lexend_400Regular,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  if (authLoading) {
    return null;
  }

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Atencao", "Preencha e-mail e senha.");
      return;
    }

    setLoading(true);

    try {
      await login(email, senha);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.screenHeader}>
            <TouchableOpacity
              onPress={() => router.replace("/")}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={P.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageTitle}>Bem Vindo!</Text>

            <InputField
              label="Email"
              placeholder="Digite seu Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <InputField
              label="Senha"
              placeholder="Digite sua senha"
              password
              value={senha}
              onChangeText={setSenha}
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push("/forgot-password")}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnDark, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.btnDarkText}>
                {loading ? "Entrando..." : "Entre ->"}
              </Text>
            </TouchableOpacity>

            <OrDivider />

            <TouchableOpacity
              style={[styles.btnGoogle, googleLoading && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={signInWithGoogle}
              disabled={googleLoading}
            >
              <AntDesign
                name="google"
                size={20}
                color={P.white}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.btnGoogleText}>
                {googleLoading ? "Conectando..." : "Continue com Google"}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomMuted}>Nao tem uma conta? </Text>
              <TouchableOpacity
                onPress={() => router.push("/register")}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomBold}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.background },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 32,
  },
  scrollContent: {},
  screenHeader: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  separator: {
    height: 1,
    backgroundColor: P.stroke,
    marginHorizontal: -32,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: P.dark,
    marginBottom: 64,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 32,
    marginBottom: 64,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: Fonts.semibold,
    color: P.primary,
  },
  btnDark: {
    backgroundColor: P.dark,
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDarkText: {
    color: P.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  btnGoogle: {
    backgroundColor: P.primary,
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnGoogleText: {
    color: P.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  bottomMuted: { fontSize: 13, fontFamily: Fonts.regular, color: P.textMuted },
  bottomBold: { fontSize: 13, fontFamily: Fonts.bold, color: P.dark },
});
