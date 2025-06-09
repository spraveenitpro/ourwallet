// app/index.tsx
import { useEffect } from "react";
import { Text, View } from "react-native";
import WalletInfo from "../components/WalletInfo";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setInfo } from "../store/reducers/info";
import * as liquidSdk from "@breeztech/react-native-breez-sdk-liquid";
import { useNavigation } from "expo-router";

export default function Index() {
  const dispatch = useAppDispatch();
  const info = useAppSelector((store) => store.info);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: "Breez Nodeless SDK RN Demo" });
  }, [navigation]);

  useEffect(() => {
    liquidSdk
      .getInfo()
      .then((info) => dispatch(setInfo(info)))
      .catch(console.error);
  }, [dispatch]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {info ? (
        <WalletInfo info={info.walletInfo} />
      ) : (
        <Text>Loading wallet information...</Text>
      )}
    </View>
  );
}
