import React from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import Mapa from './src/components/mapa/mapa'; // Importe o componente Mapa
import { Cabecalho } from './src/components/cabecalho'; // Importe o componente Header
import Constants from 'expo-constants';
import { DetalhesLinha } from './src/components/detalhes'; // Importe o componente de detalhes

const statusBarHeight = Constants.statusBarHeight;

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Cabecalho />
      </View>

        <View style={styles.mapAndDetailsContainer}>
          <View style={styles.mapaControl}>
            <Mapa />
          </View>

        </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    position: 'absolute',
    top: statusBarHeight,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    marginTop: statusBarHeight,
  },
  mapAndDetailsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  mapaControl: {
    flex: 3,
  },
  detailsText: {
    fontSize: 16,
    color: '#333',
  },
});
