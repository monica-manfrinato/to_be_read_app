import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import ListaLivrosScreen from "./src/screens/ListaLivrosScreen"

export default function App() {
  return (
    <>
      <ListaLivrosScreen />
      <StatusBar style="auto" />
    </>
  );
}
