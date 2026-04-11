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
import { useRouter } from "expo-router";
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
import { AuthService } from "../service/auth.service";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useFonts({
    Lexend_400Regular,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Atenção", "Digite seu e-mail de recuperação.");
      return;
    }
    setLoading(true);
    try {
      await AuthService.forgotPassword(email);
      setSent(true);
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
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={P.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCard}>
            <View style={styles.innerIconCircle}>
              <Ionicons name="lock-closed" size={26} color={P.dark} />
            </View>
          </View>

          {/* Tela de sucesso após envio */}
          {sent ? (
            <View style={styles.sentContainer}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={P.primary}
                style={{ alignSelf: "center", marginBottom: 24 }}
              />
              <Text style={styles.title}>E-mail enviado!</Text>
              <Text style={styles.subtitle}>
                Verifique sua caixa de entrada em{" "}
                <Text style={styles.subtitleAccent}>{email}</Text> e siga as
                instruções para redefinir sua senha.
              </Text>
              <TouchableOpacity
                style={styles.btnDark}
                onPress={() => router.push("/login")}
                activeOpacity={0.85}
              >
                <Text style={styles.btnDarkText}>Voltar ao Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Esqueceu a senha?</Text>

              <Text style={styles.subtitle}>
                Insira o e-mail associado à sua conta{" "}
                <Text style={styles.subtitleAccent}>MemoRise</Text> para receber
                as instruções de recuperação.
              </Text>

              <View style={styles.inputWrapper}>
                <InputField
                  label="E-mail de recuperação"
                  placeholder="exemplo@gmail.com"
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  bgColor={P.background}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity
                style={[styles.btnDark, loading && { opacity: 0.7 }]}
                onPress={handleReset}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Text style={styles.btnDarkText}>
                  {loading ? "Enviando..." : "Redefinir Senha"}
                </Text>
                {!loading && (
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={P.white}
                    style={styles.btnIcon}
                  />
                )}
              </TouchableOpacity>

              <View style={styles.bottomRow}>
                <Text style={styles.bottomMuted}>Lembrou sua senha? </Text>
                <TouchableOpacity
                  onPress={() => router.push("/login")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bottomLink}>Entrar agora</Text>
                </TouchableOpacity>
              </View>
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
  sentContainer: {
    flex: 1,
    paddingTop: 16,
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
  subtitleAccent: {
    color: P.primary,
    fontFamily: Fonts.bold,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 32,
  },
  btnDark: {
    height: 54,
    borderRadius: 14,
    backgroundColor: P.dark,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
  },
  btnDarkText: {
    color: P.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  btnIcon: {
    marginLeft: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  bottomMuted: {
    fontSize: 14,
    color: P.textMuted,
  },
  bottomLink: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: P.primary,
  },
});
