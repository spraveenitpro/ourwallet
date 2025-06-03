import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import * as liquidSdk from "@breeztech/react-native-breez-sdk-liquid";
import {
  defaultConfig,
  LiquidNetwork,
  SdkEvent,
  SdkEventVariant,
} from "@breeztech/react-native-breez-sdk-liquid";

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

async function onEvent(e) {
  console.log("RECEIVED NEW EVENT", e);
  switch (e.type) {
    case SdkEventVariant.SYNCED:
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

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
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
