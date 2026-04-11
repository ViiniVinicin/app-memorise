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
  row: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: P.stroke },
  text: {
    marginHorizontal: 12,
    fontSize: 13,
    fontFamily: Fonts.semibold,
    color: P.textMuted,
  },
});

export default function RegisterScreen() {
  const { register, token, isLoading: authLoading } = useAuth();
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
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

  const handleRegister = async () => {
    if (!nome || !email || !senha || !confirma) {
      Alert.alert("Atencao", "Preencha todos os campos.");
      return;
    }

    if (senha !== confirma) {
      Alert.alert("Atencao", "As senhas nao coincidem.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Atencao", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await register(nome, email, senha);
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.screenHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={P.dark} />
          </TouchableOpacity>

          <Text style={styles.screenTitle}>MemoRise</Text>

          <View style={styles.backBtn} />
        </View>
        <View style={styles.separator} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            {"Junte-se ao MemoRise para dominar\nsua memoria com nossos cards."}
          </Text>

          <InputField
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            leftIcon="person-outline"
            autoCapitalize="words"
            value={nome}
            onChangeText={setNome}
          />
          <InputField
            label="Email"
            placeholder="Digite seu email"
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            label="Senha"
            placeholder="Digite a senha"
            leftIcon="lock-closed-outline"
            password
            value={senha}
            onChangeText={setSenha}
          />
          <InputField
            label="Confirme a senha"
            placeholder="Repita a senha"
            leftIcon="sync-outline"
            password
            value={confirma}
            onChangeText={setConfirma}
          />

          <TouchableOpacity
            style={[styles.btnDark, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.btnDarkText}>
              {loading ? "Criando conta..." : "Criar Conta"}
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
            <Text style={styles.bottomMuted}>Ja tem uma conta? </Text>
            <TouchableOpacity
              onPress={() => router.push("/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomBold}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.background },
  flex: { flex: 1 },
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    paddingHorizontal: 32,
  },
  backBtn: {
    width: 36,
    height: 36,
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
  },
  scrollContent: {
    paddingHorizontal: 32,
    marginTop: 32,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: P.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: P.dark,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  btnDark: {
    backgroundColor: P.dark,
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
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
  bottomBold: { fontSize: 13, fontFamily: Fonts.bold, color: P.primary },
});
