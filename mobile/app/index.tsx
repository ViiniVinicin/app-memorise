import { Palette as P } from '@/constants/palette';
import { ms, rs, screen, vs } from '@/constants/responsive';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import {
  Lexend_400Regular,
  Lexend_600SemiBold,
  Lexend_700Bold,
  useFonts,
} from '@expo-google-fonts/lexend';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { token, isLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  const router = useRouter();

  if (!fontsLoaded || isLoading) return null;
  if (token) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.background} />

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="book-outline" size={rs(22)} color={P.dark} />
            <Text style={styles.logoText}>MemoRise</Text>
          </View>
          <TouchableOpacity style={styles.helpBtn} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={rs(28)} color={P.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Image
            source={require('../assets/images/MemoRiseLogo1.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.titleDark}>{'Desbloqueie\nSeu'}</Text>
          <Text style={styles.titlePink}>Potencial</Text>
          <Text style={styles.subtitle}>
            {'Domine qualquer assunto com\nflashcards interativos.'}
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Comece Agora →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>Entre ↪</Text>
          </TouchableOpacity>
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
    paddingHorizontal: rs(32),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: vs(70),
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  logoText: {
    fontSize: ms(20),
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  helpBtn: {
    width: rs(34),
    height: rs(34),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    width: '100%',
    height: screen.isSmall ? vs(220) : vs(280),
    borderRadius: rs(24),
    overflow: 'hidden',
    marginBottom: vs(24),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: vs(24),
  },
  titleDark: {
    fontFamily: Fonts.bold,
    fontSize: ms(screen.isSmall ? 28 : 36),
    color: P.dark,
    textAlign: 'center',
    lineHeight: ms(screen.isSmall ? 34 : 44),
  },
  titlePink: {
    fontFamily: Fonts.bold,
    fontSize: ms(screen.isSmall ? 28 : 36),
    color: P.primary,
    textAlign: 'center',
    marginBottom: vs(12),
    lineHeight: ms(screen.isSmall ? 34 : 44),
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: ms(14),
    color: P.dark,
    textAlign: 'center',
    lineHeight: ms(22),
  },
  buttons: {
    gap: vs(12),
  },
  btnPrimary: {
    backgroundColor: P.primary,
    borderRadius: rs(14),
    height: vs(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: P.white,
    fontSize: ms(16),
    fontFamily: Fonts.bold,
  },
  btnSecondary: {
    backgroundColor: P.secondary,
    borderRadius: rs(14),
    height: vs(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: P.white,
    fontSize: ms(16),
    fontFamily: Fonts.semibold,
  },
});
