# OurWallet

A simple, cross-platform mobile wallet built with React Native and powered by the [Breez SDK](https://github.com/breez/breez-sdk) for seamless Bitcoin and Lightning Network payments.

## Features

- Cross-platform: Works on iOS, Android, and web (via Expo).
- Built with React Native and Expo for rapid development.
- Integrates the Breez SDK for Lightning Network and Bitcoin wallet functionality.
- Modern, clean UI with customizable assets.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/):
  ```bash
  npm install -g expo-cli
  ```

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/ourwallet.git
   cd ourwallet
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**

   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on your device:**
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For Web: `npm run web`

### Configuration

This project uses the `@breeztech/react-native-breez-sdk-liquid` package.  
To enable wallet features, you may need to configure the SDK with your credentials and network settings.  
Refer to the [Breez SDK documentation](https://github.com/breez/breez-sdk) for integration details.

### Project Structure

- `App.js` – Main application entry point.
- `index.js` – Registers the root component.
- `assets/` – App icons and splash images.
- `package.json` – Project dependencies and scripts.

## Customization

- Replace images in the `assets/` folder to update the app icon and splash screen.
- Extend `App.js` to add wallet features, UI, and navigation.

## License

MIT
