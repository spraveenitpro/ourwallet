// app/_layout.tsx
import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { Text } from "react-native";
import { Provider } from "react-redux";
import { store } from "../store";
import { setInfo } from "../store/reducers/info";
import * as liquidSdk from "@breeztech/react-native-breez-sdk-liquid";
import { setPayments } from "@/store/reducers/payments";
import {
  defaultConfig,
  LiquidNetwork,
  SdkEvent,
  SdkEventVariant,
} from "@breeztech/react-native-breez-sdk-liquid";

async function onEvent(e: SdkEvent) {
  console.log("RECEIVED NEW EVENT", e);
  switch (e.type) {
    case SdkEventVariant.SYNCED:
      await liquidSdk.getInfo();
      liquidSdk
        .getInfo()
        .then((info) => store.dispatch(setInfo(info)))
        .catch(console.error);
      liquidSdk
        .listPayments({ limit: undefined })
        .then((payments) => store.dispatch(setPayments(payments)))
        .catch(console.error);
      break;
  }
}

async function initSdk() {
  const config = await defaultConfig(
    LiquidNetwork.MAINNET,
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
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Breez Nodeless SDK RN Demo",
          }}
        />
        <Stack.Screen
          name="receive"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="send"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
          }}
        />
      </Stack>
    </Provider>
  );
}
