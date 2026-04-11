import { useAuth } from "@/context/auth.context";
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId,
      iosClientId,
      offlineAccess: false,
    });
  }, []);

  async function signInWithGoogle() {
    if (Platform.OS === "web") {
      Alert.alert(
        "Nao suportado",
        "O login nativo do Google precisa ser testado no Android ou iOS, fora do Expo Go.",
      );
      return;
    }

    if (!webClientId) {
      Alert.alert(
        "Configuracao necessaria",
        "Defina o EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID em mobile/.env.local.",
      );
      return;
    }

    setIsLoading(true);

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      if (isCancelledResponse(response)) {
        return;
      }

      if (!isSuccessResponse(response)) {
        Alert.alert("Erro", "Nao foi possivel concluir o login com Google.");
        return;
      }

      const idToken = response.data.idToken;

      if (!idToken) {
        Alert.alert(
          "Erro",
          "O Google nao retornou um idToken valido para autenticacao.",
        );
        return;
      }

      await loginWithGoogle(idToken);
      router.replace("/(tabs)");
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert("Aguarde", "O login com Google ja esta em andamento.");
            return;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              "Google Play Services",
              "Atualize ou ative o Google Play Services no dispositivo para continuar.",
            );
            return;
          default:
            Alert.alert("Erro", error.message ?? "Falha ao autenticar com Google.");
            return;
        }
      }

      Alert.alert(
        "Erro",
        error?.message ?? "Falha inesperada ao autenticar com Google.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    signInWithGoogle,
    isLoading,
  };
}
