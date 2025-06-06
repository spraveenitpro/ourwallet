import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { setInfo } from "./store/reducers/info";
import { store } from "./store";
import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import * as liquidSdk from "@breeztech/react-native-breez-sdk-liquid";
import WalletInfo from "./components/WalletInfo";
import { useAppDispatch, useAppSelector } from "./store/hooks";

import {
  defaultConfig,
  LiquidNetwork,
  SdkEvent, // <- NEW: Add this
  SdkEventVariant, // <- NEW: Add this
} from "@breeztech/react-native-breez-sdk-liquid";

async function initSdk() {
  const config = await defaultConfig(
    LiquidNetwork.TESTNET,
    process.env.EXPO_PUBLIC_BREEZ_API_KEY
  );

  const mnemonic = process.env.EXPO_PUBLIC_MNEMONIC;
  if (!mnemonic) throw Error("No mnemonic found");

  // try {
  //   await liquidSdk.connect({ mnemonic, config });
  //   console.log("Breez SDK connected!");
  // } catch (err) {
  //   console.error("Failed to connect Breez SDK:", err);
  // }
  await liquidSdk.connect({ config, mnemonic });
  await liquidSdk.addEventListener(onEvent).catch(console.error);
}

function AppContent() {
  let [connected, setConnected] = useState(false);

  // ADD these Redux hooks:
  const dispatch = useAppDispatch();
  const info = useAppSelector((store) => store.info);

  useEffect(() => {
    initSdk()
      .then(() => setConnected(true))
      .catch(console.error);

    return () => {
      liquidSdk.disconnect();
      setConnected(false);
    };
  }, []);

  // useEffect(() => {
  //   liquidSdk.addEventListener(onEvent);
  //   return () => {
  //     liquidSdk.removeEventListener(onEvent);
  //   };
  // }, []);

  // REMOVE the old event listener useEffect and ADD this instead:
  // Get initial wallet info once connected
  useEffect(() => {
    if (connected) {
      liquidSdk
        .getInfo()
        .then((info) => dispatch(setInfo(info)))
        .catch(console.error);
    }
  }, [connected, dispatch]);

  // UPDATE the loading state to match tutorial:
  if (!connected) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    // <View style={styles.container}>
    //   <Text>{connected ? "Breez SDK connected!!!" : "Loading..."}</Text>
    //   <StatusBar style="auto" />
    // </View>
    <View style={styles.container}>
      <Text style={styles.title}>Breez Nodeless SDK RN Demo</Text>
      {info ? (
        <WalletInfo info={info.walletInfo} />
      ) : (
        <Text>Loading wallet information...</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

// async function onEvent(e) {
//   if (e.type === "SYNCED") {
//     await liquidSdk
//       .getInfo()
//       .then((info) => store.dispatch(setInfo(info)))
//       .catch(console.error);
//   }
// }

// REPLACE your current onEvent function with this:
async function onEvent(e: SdkEvent) {
  console.log("RECEIVED NEW EVENT", e);
  switch (e.type) {
    case SdkEventVariant.SYNCED:
      await liquidSdk
        .getInfo()
        .then((info) => store.dispatch(setInfo(info)))
        .catch(console.error);
      break;
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
