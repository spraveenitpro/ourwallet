// app/_layout.tsx
import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { Text } from "react-native";
import { Provider } from "react-redux";
import { store } from "../store";
import { setInfo } from "../store/reducers/info";
import * as liquidSdk from "@breeztech/react-native-breez-sdk-liquid";
import {
  defaultConfig,
  LiquidNetwork,
  SdkEvent,
  SdkEventVariant,
} from "@breeztech/react-native-breez-sdk-liquid";

async function onEvent(e: SdkEvent) {
  if (e.type === SdkEventVariant.SYNCED) {
    await liquidSdk
      .getInfo()
      .then((info) => store.dispatch(setInfo(info)))
      .catch(console.error);
  }
}

async function initSdk() {
  const config = await defaultConfig(
    LiquidNetwork.TESTNET,
    process.env.EXPO_PUBLIC_BREEZ_API_KEY
  );
  const mnemonic = process.env.EXPO_PUBLIC_MNEMONIC;
  if (!mnemonic) throw Error("No mnemonic found");
  await liquidSdk.connect({ config, mnemonic });
  await liquidSdk.addEventListener(onEvent).catch(console.error);
}

export default function RootLayout() {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initSdk();
      setSdkReady(true);
    })();
  }, []);

  if (!sdkReady) {
    // Optionally show a loading screen
    return <Text>Initializing SDK...</Text>;
  }

  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="index" />
      </Stack>
    </Provider>
  );
}
