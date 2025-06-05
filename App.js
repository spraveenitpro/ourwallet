import { StatusBar } from "expo-status-bar";
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

export default function App() {
  let [connected, setConnected] = useState(false);

  useEffect(() => {
    initSdk().then(() => setConnected(true));

    return () => {
      liquidSdk.disconnect();
      setConnected(false);
    };
  }, []);

  if (!connected)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ textAlign: "center" }}>Loading...</Text>
      </View>
    );
  return (
    <View style={styles.container}>
      <Text>Breez SDK connected!!!</Text>
      <StatusBar style="auto" />
    </View>
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
