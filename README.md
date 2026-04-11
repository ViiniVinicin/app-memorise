# MemoRise

Aplicativo mobile de flashcards com repeticao espaciada, com backend em Node.js/Express, banco PostgreSQL e app mobile em Expo/React Native.

## Stack

- Backend: Node.js, Express, Prisma, PostgreSQL
- Mobile: Expo 54, React Native 0.81, Expo Router
- Auth: JWT + Google Sign-In nativo

## Requisitos

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Android Studio
- Android SDK + Emulator
- Java/JDK configurado para Android build

## Estrutura

```text
app-memorise/
  server.js
  prisma/
  mobile/
```

## 1. Clonar e instalar

Na raiz do projeto:

```bash
git clone <url-do-repo>
cd app-memorise
npm install
cd mobile
npm install
```

## 2. Configurar o backend

Na raiz do projeto, crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

Preencha pelo menos:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/memorise?schema=app-memorise-db
JWT_SECRET=coloque-uma-chave-grande-e-segura
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-app-password-do-gmail
EXPO_IP=SEU_IP_LOCAL
PORT=3000

GOOGLE_ANDROID_CLIENT_ID=...
GOOGLE_WEB_CLIENT_ID=...
GOOGLE_IOS_CLIENT_ID=...
```

Observacoes:

- `EXPO_IP` e usado nos links de reset de senha.
- `SMTP_PASS` deve ser uma App Password do Gmail, nao sua senha comum.
- Os `GOOGLE_*_CLIENT_ID` sao opcionais.
- Preencha os `GOOGLE_*_CLIENT_ID` apenas se voce quiser testar login com Google.
- Se voce for usar apenas cadastro/login com email e senha, pode deixar os campos do Google vazios.

## 3. Criar o banco

Crie um banco PostgreSQL chamado `memorise`, ou ajuste a `DATABASE_URL` para o nome que preferir.

Depois rode as migracoes:

```bash
cd app-memorise
npx prisma migrate deploy
```

Se quiser inspecionar o banco:

```bash
npm run db:studio
```

## 4. Rodar o backend

Na raiz:

```bash
npm run dev
```

Ou:

```bash
npm start
```

Servidor esperado:

```text
http://localhost:3000
```

## 5. Configurar o mobile

Dentro de `mobile/`, crie o `.env.local`:

```bash
copy .env.local.example .env.local
```

Preencha:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
```

URLs comuns:

- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Celular fisico: `http://SEU_IP_LOCAL:3000`

Observacoes:

- Os `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` sao opcionais.
- Preencha os IDs do Google apenas se voce quiser usar o botao `Continue com Google`.
- Se voce for testar apenas login/cadastro com email e senha, basta configurar `EXPO_PUBLIC_API_URL`.

## 6. Rodar o app Android do jeito correto

O login com Google **nao deve ser testado no Expo Go**.

Use um development build nativo.

### Primeira execucao

1. Abra o Android Studio
2. Inicie um emulator no Device Manager
3. Rode:

```bash
cd app-memorise/mobile
npx expo run:android
```

Esse comando:

- gera o app Android nativo
- instala no emulator
- inclui os modulos nativos necessarios

### Depois da primeira instalacao

Para desenvolvimento normal:

```bash
cd app-memorise/mobile
npx expo start --dev-client
```

Abra no emulator o app instalado do projeto, e nao o Expo Go.

## 7. Google Sign-In

Esta secao e opcional.

Se voce nao for usar login com Google, pode ignorar tudo abaixo e testar o sistema normalmente com:

- cadastro por email e senha
- login por email e senha
- JWT local do backend

Para o Google login funcionar, o projeto precisa estar configurado no Google Cloud Console com:

- Tela de consentimento OAuth
- Client ID Android
- Client ID Web
- Client ID iOS

Valores usados no app:

- Android package: `com.anonymous.appmemorisemobile`
- iOS bundle identifier: `com.anonymous.appmemorisemobile`

Para Android dev local, o SHA-1 de debug usado foi:

```text
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### Os IDs do Google sao iguais para todo mundo?

Nao necessariamente.

- `Web client ID`: normalmente pode ser compartilhado por todos.
- `iOS client ID`: normalmente pode ser compartilhado por todos, desde que o `bundleIdentifier` continue igual.
- `Android client ID`: pode variar por maquina, porque ele depende do `package name` + `SHA-1` da chave que assina o app.

### Se eu ja configurei o Google Cloud, meus colegas precisam configurar tambem?

Depende do caso:

- Se eles nao forem usar login com Google: nao precisam configurar nada do Google Cloud.
- Se eles forem usar login com Google via email e senha comum: nao precisam configurar nada do Google Cloud.
- Se eles forem usar o botao do Google: talvez precisem de ajuste.

### Quando seus colegas podem reutilizar sua configuracao

Eles podem reutilizar seu projeto do Google Cloud e os mesmos IDs em varios casos:

- o `Web client ID` pode ser reutilizado
- o `iOS client ID` pode ser reutilizado
- o mesmo projeto Google Cloud pode ser reutilizado por toda a equipe

### Quando o Android pode precisar de nova configuracao

No Android, o Google valida:

- `package name`
- `SHA-1`

Se o colega clonar o projeto em outra maquina, o `debug.keystore` dele pode gerar outro `SHA-1`.
Nesse caso, o login com Google no Android pode falhar mesmo com os mesmos IDs no `.env`.

Se isso acontecer, existem 2 caminhos:

1. Criar outro `OAuth client ID` Android no mesmo projeto Google Cloud usando o `SHA-1` da maquina do colega.
2. Compartilhar a mesma `debug.keystore` entre as maquinas da equipe.

Para projeto de faculdade, o caminho mais simples costuma ser:

- manter o mesmo projeto Google Cloud
- reaproveitar `Web client ID` e `iOS client ID`
- criar novo `Android client ID` apenas se o login Google falhar em outra maquina

### Usuarios de teste

Se a tela de consentimento OAuth estiver em modo `Testing`, cada pessoa que for testar login com Google precisa estar adicionada como `Test user` no Google Cloud Console.

### Resumo pratico

- Sem Google: nao precisa configurar IDs, funciona com email e senha.
- Com Google no web/iOS: normalmente os IDs existentes ja bastam.
- Com Google no Android: pode precisar de novo client ID por causa do `SHA-1`.
- O projeto Google Cloud pode ser o mesmo para toda a equipe.

## Scripts uteis

Raiz:

```bash
npm run dev
npm run db:migrate
npm run db:studio
npm run check
```

Mobile:

```bash
npm run android
npm run web
npm run lint
npx expo start --dev-client
```

## Problemas comuns

### `Network request failed`

- confira se o backend esta rodando
- confira o `EXPO_PUBLIC_API_URL`
- no emulator Android, use `10.0.2.2`

### `adb devices` nao mostra o emulator

- abra o emulator manualmente pelo Android Studio
- ou use:

```bash
C:\Users\%USERNAME%\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Medium_Phone_API_36.1
```

### Google Sign-In bloqueado no browser

- isso acontece no Expo Go
- use build nativa com `npx expo run:android`

### Erro de banco/migracao

- verifique se o PostgreSQL esta rodando
- verifique a `DATABASE_URL`
- confirme que o banco existe

## Fluxo rapido

Terminal 1:

```bash
cd app-memorise
npm run dev
```

Terminal 2:

```bash
cd app-memorise/mobile
npx expo start --dev-client
```

Se for a primeira vez ou se mudou alguma dependencia nativa:

```bash
cd app-memorise/mobile
npx expo run:android
```
