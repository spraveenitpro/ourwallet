import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as liquidSdk from "@breeztech/react-native-breez-sdk-liquid";

function WalletInfo({ info }) {
  return (
    <View style={{ alignItems: "center", margin: 10 }}>
      <Text style={{ fontSize: 28, color: "#0184fb" }}>
        {info.balanceSat} ₿
      </Text>
      {info.pendingReceiveSat > 0 && (
        <Text style={{ color: "#606060", fontStyle: "italic" }}>
          Pending inward balance: {info.pendingReceiveSat} ₿
        </Text>
      )}
      {info.pendingSendSat > 0 && (
        <Text style={{ color: "#606060", fontStyle: "italic" }}>
          Pending outward balance: {info.pendingSendSat} ₿
        </Text>
      )}
    </View>
  );
}

function PaymentsList({ payments }) {
  return (
    <View style={{ height: "50%", width: "80%" }}>
      <ScrollView>
        {payments.length > 0 ? (
          payments.map((p, i) => (
            <View
              key={`payment-${i}`}
              style={{
                paddingVertical: 15,
                paddingHorizontal: 20,
                borderColor: "#b0b0b0",
                borderRadius: 5,
                borderBottomWidth: 1,
                flex: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "99%",
                  paddingVertical: 2,
                }}
              >
                <View>
                  <Text style={{ fontSize: 16 }}>
                    {p.paymentType === "SEND" ? "-" : "+"}
                    {p.amountSat} ₿
                  </Text>
                  <Text style={{ fontSize: 12, fontStyle: "italic" }}>
                    {p.details?.description}
                  </Text>
                </View>
                <Text style={{ fontSize: 13 }}>{p.status?.toUpperCase()}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: "center", paddingVertical: 5 }}>
            No payment history
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState("main"); // main, prepare, confirm, final
  const [walletInfo, setWalletInfo] = useState(null);
  const [payments, setPayments] = useState([]);
  const [payerAmount, setPayerAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("LIQUID_ADDRESS");
  const [prepareResponse, setPrepareResponse] = useState(null);
  const [receiveResponse, setReceiveResponse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch wallet info and payments on mount
    liquidSdk.getInfo().then(setWalletInfo).catch(console.error);
    liquidSdk
      .listPayments({ limit: undefined })
      .then(setPayments)
      .catch(console.error);
  }, []);

  // Payment methods
  const PAYMENT_METHODS = {
    LIQUID: "LIQUID_ADDRESS",
    LIGHTNING: "LIGHTNING",
    BITCOIN: "BITCOIN_ADDRESS",
  };

  // Handlers for receive flow
  const handlePrepare = async () => {
    setError("");
    if (!payerAmount) return setError("Enter an amount");
    try {
      const resp = await liquidSdk.prepareReceivePayment({
        amount: {
          type: liquidSdk.ReceiveAmountVariant.BITCOIN,
          payerAmountSat: payerAmount,
        },
        paymentMethod: paymentMethod as any, // Fix: cast to any to bypass type error
      });
      setPrepareResponse(resp);
      setScreen("confirm");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleConfirm = async () => {
    setError("");
    try {
      const resp = await liquidSdk.receivePayment(prepareResponse);
      setReceiveResponse(resp);
      setScreen("final");
    } catch (e) {
      setError(e.message);
    }
  };

  // Main screen
  if (screen === "main") {
    return (
      <View style={styles.container}>
        {walletInfo ? (
          <WalletInfo info={walletInfo.walletInfo} />
        ) : (
          <Text>Loading wallet info...</Text>
        )}
        <View style={{ paddingVertical: 5, flexDirection: "row", gap: 5 }}>
          <Pressable onPress={() => setScreen("prepare")} style={styles.button}>
            <Text style={{ color: "#0184fb" }}>Add funds</Text>
          </Pressable>
        </View>
        <PaymentsList payments={payments} />
      </View>
    );
  }

  // Prepare receive screen
  if (screen === "prepare") {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>Amount (sats)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          defaultValue="0"
          onChangeText={(text) => setPayerAmount(Number(text))}
        />
        <Text style={{ textAlign: "center", marginBottom: 5 }}>
          Payment Method
        </Text>
        <View style={styles.methodRow}>
          {Object.entries(PAYMENT_METHODS).map(([name, method], i) => (
            <Pressable
              key={`payment-method-${name}`}
              onPress={() => setPaymentMethod(method)}
              style={[
                styles.methodButton,
                paymentMethod === method && { backgroundColor: "#0184fb" },
              ]}
            >
              <Text style={paymentMethod === method ? { color: "white" } : {}}>
                {name}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={handlePrepare} style={styles.buttonFilled}>
          <Text style={{ color: "white" }}>CONTINUE</Text>
        </Pressable>
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        <Pressable onPress={() => setScreen("main")} style={styles.button}>
          <Text>Back</Text>
        </Pressable>
      </View>
    );
  }

  // Confirm receive screen
  if (screen === "confirm") {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>Confirm payment?</Text>
        <Text selectable style={{ textAlign: "center" }}>
          {prepareResponse?.destination}
        </Text>
        <Pressable onPress={handleConfirm} style={styles.buttonFilled}>
          <Text style={{ color: "white" }}>CONFIRM</Text>
        </Pressable>
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        <Pressable onPress={() => setScreen("main")} style={styles.button}>
          <Text>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  // Final receive screen
  if (screen === "final") {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          Please pay the following destination:
        </Text>
        <Text selectable style={{ textAlign: "center" }}>
          {receiveResponse?.destination}
        </Text>
        <Pressable onPress={() => setScreen("main")} style={styles.button}>
          <Text>Done</Text>
        </Pressable>
      </View>
    );
  }

  // Fallback
  return <Text>Unknown screen</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderColor: "lightgray",
    borderWidth: 1,
    borderRadius: 20,
    margin: 5,
  },
  buttonFilled: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#0184fb",
    borderRadius: 5,
    margin: 5,
  },
  input: {
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#0184fb",
    textAlign: "center",
    fontSize: 14,
    width: 120,
    marginBottom: 10,
  },
  methodRow: {
    flexDirection: "row",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 10,
  },
  methodButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderColor: "gray",
    borderRightWidth: 1,
  },
});
