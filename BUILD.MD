# 🚀 Step-by-Step Guide: Using Custom Development Builds in Expo

Expo Go is great for rapid prototyping, but it **does not support custom native modules**. To use packages like `@breeztech/react-native-breez-sdk-liquid`, you need a **custom development build**. This guide will walk you through the process.

---

## 1. Prerequisites

- Node.js (v16+ recommended)
- Yarn or npm
- Xcode (for iOS) or Android Studio (for Android)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

```bash
npm install -g expo-cli
```

---

## 2. Initialize or Upgrade Your Project

If you already have a project, skip to the next step.  
To create a new project:

```bash
npx create-expo-app my-app
cd my-app
```

Upgrade to the latest Expo SDK if needed:

```bash
npx expo upgrade
```

---

## 3. Install Your Custom Native Module

For example, to install the Breez SDK:

```bash
npm install @breeztech/react-native-breez-sdk-liquid
# or
yarn add @breeztech/react-native-breez-sdk-liquid
```

---

## 4. Install expo-dev-client

This package allows you to create a custom Expo Go app with your native modules.

```bash
npx expo install expo-dev-client
```

---

## 5. Prebuild Your Project

This step generates the native `ios` and `android` directories if they don't exist.

```bash
npx expo prebuild
```

---

## 6. Install iOS/Android Dependencies

**iOS:**

```bash
cd ios
pod install
cd ..
```

**Android:**  
No manual steps needed; dependencies are handled automatically.

---

## 7. Create and Install the Custom Development Build

**iOS Simulator:**

```bash
npx expo run:ios
```

**Android Emulator:**

```bash
npx expo run:android
```

- This will build and install a custom Expo app on your simulator/emulator.
- The first build may take several minutes.

---

## 8. Start the Metro Bundler

In a separate terminal, start the development server:

```bash
npx expo start
```

---

## 9. Open Your App

- **Do NOT use Expo Go.**
- Open the app using the custom dev client installed on your simulator/device.
- You can now use all custom native modules!

---

## 10. Rebuilding After Native Changes

If you add or update native modules, **rebuild the dev client**:

```bash
npx expo run:ios
# or
npx expo run:android
```

---

## 11. Resources

- [Expo Custom Dev Client Docs](https://docs.expo.dev/clients/installation/)
- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [Expo Bare Workflow](https://docs.expo.dev/bare/using-expo-client/)

---

## 📝 Notes

- **Expo Go will NOT work** with custom native modules.
- Always use your custom dev client for development.
- For production, use EAS Build or your own build process.

---

Happy hacking! If you have any issues, check the [Expo forums](https://forums.expo.dev/) or open an issue on GitHub.
