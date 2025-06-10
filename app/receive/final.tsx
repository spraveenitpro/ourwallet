import React, { useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { useNavigation } from "expo-router";
import { Text } from "react-native";

export default function ReceiveFinal() {
  const navigation = useNavigation();

  const receiveResponse = useAppSelector(
    (store) => store.receive.receiveResponse
  );

  useEffect(() => {
    if (!receiveResponse) {
      navigation.goBack();
    } else {
      console.log("Receive destination:", receiveResponse.destination);
    }
  }, [receiveResponse, navigation]);

  if (!receiveResponse) {
    // Optionally render nothing or a loading indicator
    return null;
  }

  return (
    <>
      <Text style={{ textAlign: "center" }}>
        Please pay the following destination:
      </Text>
      <Text selectable style={{ textAlign: "center" }}>
        {receiveResponse.destination}
      </Text>
    </>
  );
}
