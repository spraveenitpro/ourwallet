import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { setInfo } from "./store/reducers/info";
import { store } from "./store";
import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import * as liquidSdk from "@breeztech/react-native-breez-sdk-liquid";

import {
  defaultConfig,
  LiquidNetwork,
} from "@breeztech/react-native-breez-sdk-liquid";

async function initSdk() {
  const config = await defaultConfig(
    LiquidNetwork.TESTNET,
    process.env.EXPO_PUBLIC_BREEZ_API_KEY
  );

  const mnemonic = process.env.EXPO_PUBLIC_MNEMONIC;
  if (!mnemonic) throw Error("No mnemonic found");

  try {
    await liquidSdk.connect({ mnemonic, config });
    console.log("Breez SDK connected!");
  } catch (err) {
    console.error("Failed to connect Breez SDK:", err);
  }
}

function AppContent() {
  let [connected, setConnected] = useState(false);

  useEffect(() => {
    initSdk().then(() => setConnected(true));

    return () => {
      liquidSdk.disconnect();
      setConnected(false);
    };
  }, []);

  useEffect(() => {
    liquidSdk.addEventListener(onEvent);
    return () => {
      liquidSdk.removeEventListener(onEvent);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>{connected ? "Breez SDK connected!!!" : "Loading..."}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

async function onEvent(e) {
  if (e.type === "SYNCED") {
    await liquidSdk
      .getInfo()
      .then((info) => store.dispatch(setInfo(info)))
      .catch(console.error);
  }
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
