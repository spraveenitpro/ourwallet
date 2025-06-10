# Lightning/Liquid Wallet Tutorial: React Native + Breez Liquid SDK (JavaScript)

A complete step-by-step guide to building a Lightning/Liquid Network wallet using React Native and the Breez Liquid SDK in pure JavaScript.

## Prerequisites

- Node.js (18 or higher)
- React Native development environment
- iOS Simulator or Android Emulator
- Basic knowledge of React Native and JavaScript

## Step 1: Initialize React Native Project

```bash
npx react-native@latest init OurWallet
cd OurWallet
```

## Step 2: Install Core Dependencies

```bash
# Core React Native dependencies
npm install react-native-svg react-native-fs

# For iOS
cd ios && pod install && cd ..
```

## Step 3: Install Breez Liquid SDK

```bash
npm install @breeztech/react-native-breez-sdk-liquid
```

**Important**: The Breez SDK contains native modules that require rebuilding your development client.

### For Development Client:

```bash
# Build new development client
npx expo install expo-dev-client
npx expo run:ios --clear-cache
# or
npx expo run:android --clear-cache
```

## Step 4: Create Basic App Structure

Replace the default App.js with our wallet app:

```javascript
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

export default function App() {
  const [screen, setScreen] = useState("main"); // main, prepare, confirm, final
  const [walletInfo, setWalletInfo] = useState(null);
  const [payments, setPayments] = useState([]);
  const [payerAmount, setPayerAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("LIQUID_ADDRESS");
  const [prepareResponse, setPrepareResponse] = useState(null);
  const [receiveResponse, setReceiveResponse] = useState(null);
  const [error, setError] = useState("");

  // Implementation will be added in following steps...

  return (
    <View style={styles.container}>
      <Text>Liquid Wallet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
```

## Step 5: Create WalletInfo Component

Add the WalletInfo component to display wallet balance:

```javascript
// Add this component before the main App component

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
```

## Step 6: Create PaymentsList Component

Add the PaymentsList component to display transaction history:

```javascript
// Add this component after WalletInfo

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
```

## Step 7: Initialize SDK and Load Data

Add the initialization logic inside the App component:

```javascript
// Add inside the App component, before the return statement

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
```

## Step 8: Implement Payment Handlers

Add the payment flow handlers:

```javascript
// Add these handlers inside the App component

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
      paymentMethod: paymentMethod, // No type casting needed in JavaScript
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
```

## Step 9: Create Main Screen

Replace the simple return statement with the main screen logic:

```javascript
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
```

## Step 10: Create Prepare Screen

Add the prepare payment screen:

```javascript
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
```

## Step 11: Create Confirm Screen

Add the confirmation screen:

```javascript
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
```

## Step 12: Create Final Screen

Add the final payment screen:

```javascript
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
```

## Step 13: Complete Styling

Add the complete StyleSheet:

```javascript
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
```

## Final Complete App.js

Here's the complete App.js file that this tutorial builds:

```javascript
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
        paymentMethod: paymentMethod,
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
```

## Key Differences from TypeScript Version

1. **No Type Annotations**: Removed all TypeScript type annotations (`: string`, `: number`, etc.)
2. **No Interfaces**: No need to define TypeScript interfaces
3. **No Type Casting**: Removed `as any` type casting - not needed in JavaScript
4. **File Extension**: Uses `.js` instead of `.tsx`
5. **Template Initialization**: Uses standard React Native template instead of TypeScript template

## Key Features

This JavaScript app demonstrates the same functionality as the TypeScript version:

1. **Wallet Info Display**: Shows current balance and pending amounts
2. **Payment History**: Lists previous transactions with amounts and status
3. **Multiple Payment Methods**: Supports Liquid, Lightning, and Bitcoin addresses
4. **Simple Navigation**: Uses conditional rendering to switch between screens
5. **Error Handling**: Displays errors when transactions fail
6. **Clean UI**: Simple, functional interface using React Native components

## Build and Test

1. **Rebuild Development Client**:

   ```bash
   npx expo run:ios --clear-cache
   # or
   npx expo run:android --clear-cache
   ```

2. **Test the App**:
   - Launch the app to see wallet balance
   - Try creating a receive payment request
   - Test different payment methods (Liquid, Lightning, Bitcoin)

## Common Issues and Solutions

### 1. SDK Not Linking

**Problem**: "Native module not found"
**Solution**: Rebuild development client after installing SDK

### 2. Connection Failures

**Problem**: Cannot connect to Liquid Network
**Solution**: Check network connectivity and SDK configuration

### 3. Build Errors

**Problem**: Native compilation issues
**Solution**: Clean builds and check React Native version compatibility

## Security Notes

- Never use this code in production without proper security review
- Store seeds and keys securely using secure storage solutions
- Implement proper backup and recovery flows
- Always use testnet for development and testing

---

This JavaScript tutorial creates the same functional Liquid wallet as the TypeScript version, but without type annotations, making it more accessible for developers who prefer pure JavaScript or are just getting started with React Native development.
