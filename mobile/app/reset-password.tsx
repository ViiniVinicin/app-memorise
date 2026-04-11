import { InputField } from "@/components/ui/input-field";
import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import {
    Lexend_400Regular,
    Lexend_600SemiBold,
    Lexend_700Bold,
    useFonts,
} from "@expo-google-fonts/lexend";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useFonts({
    Lexend_400Regular,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  const handleReset = async () => {
    if (!novaSenha || !confirma) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirma) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (!token) {
      Alert.alert("Erro", "Token inválido. Solicite um novo link.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao redefinir senha.");
      setDone(true);
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/login")}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={P.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCard}>
            <View style={styles.innerIconCircle}>
              <Ionicons
                name={done ? "checkmark" : "lock-open"}
                size={26}
                color={P.dark}
              />
            </View>
          </View>

          {done ? (
            <>
              <Text style={styles.title}>Senha redefinida!</Text>
              <Text style={styles.subtitle}>
                Sua senha foi alterada com sucesso. Faça login com a nova senha.
              </Text>
              <TouchableOpacity
                style={styles.btnDark}
                onPress={() => router.replace("/login")}
                activeOpacity={0.85}
              >
                <Text style={styles.btnDarkText}>Ir para o Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Nova senha</Text>
              <Text style={styles.subtitle}>
                Digite e confirme sua nova senha para concluir a redefinição.
              </Text>

              <InputField
                label="Nova senha"
                placeholder="Digite a nova senha"
                leftIcon="lock-closed-outline"
                password
                bgColor={P.background}
                value={novaSenha}
                onChangeText={setNovaSenha}
              />

              <InputField
                label="Confirme a nova senha"
                placeholder="Repita a nova senha"
                leftIcon="sync-outline"
                password
                bgColor={P.background}
                value={confirma}
                onChangeText={setConfirma}
              />

              <TouchableOpacity
                style={[styles.btnDark, loading && { opacity: 0.7 }]}
                onPress={handleReset}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Text style={styles.btnDarkText}>
                  {loading ? "Salvando..." : "Redefinir Senha"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 80,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  iconCard: {
    width: 120,
    height: 120,
    alignSelf: "center",
    borderRadius: 26,
    backgroundColor: P.containerBg,
    borderWidth: 1.8,
    borderColor: P.dark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  innerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.8,
    borderColor: P.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: P.dark,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: P.textMuted,
    lineHeight: 26,
    marginBottom: 32,
  },
  btnDark: {
    height: 54,
    borderRadius: 14,
    backgroundColor: P.dark,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnDarkText: {
    color: P.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
