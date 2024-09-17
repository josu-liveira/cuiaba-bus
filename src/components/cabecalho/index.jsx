// src/Header.js
import Constants from 'expo-constants';
import React from 'react';
import { View, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const statusBarHeight = Constants.statusBarHeight;

export function Cabecalho() {
  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <Pressable 
        style={styles.menuButton}
        onPress={() => console.log("CLICOU NO MENU")}
      >
        <Ionicons name="menu" size={35} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Position the header absolutely
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent', // Make sure it doesn't cover other content
    zIndex: 1, // Ensure it stays on top of other components
  },
  menuButton: {
    width: 48,
    height: 48,
    backgroundColor: '#0d6efd', // Sky blue color
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f8f9fa', // Light border color
  },
});
