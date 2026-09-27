# Dress Recommendations

An iPhone-first app (Android too) that catalogues your clothes and makeup and suggests a daily outfit based on the weather, your plans, and your mood.

Product plan: https://claude.ai/artifact/EPPgzYDrRnz7sx7LGgNwVm

## Stack

- [Expo](https://docs.expo.dev) SDK 57 with React Native and TypeScript
- Expo Router for navigation, with native tabs (`src/app/`)
- Data model for clothing, makeup, and profile in `src/types/wardrobe.ts`

## Screens

| Tab | File | Status |
| --- | --- | --- |
| Today | `src/app/index.tsx` | Placeholder |
| Catalog | `src/app/catalog.tsx` | Placeholder |
| Scan | `src/app/scan.tsx` | Placeholder |
| Settings | `src/app/settings.tsx` | Placeholder |

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your iPhone. Building for TestFlight uses EAS in the cloud, so no Mac is needed:

```bash
npx eas-cli@latest build --platform ios
```

That requires an Apple Developer account.

## Checks

```bash
npm run typecheck
npm run lint
```
