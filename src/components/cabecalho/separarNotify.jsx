import React from 'react';
import { View, StyleSheet } from 'react-native';

const SeparadorNotify = () => {
  return <View style={styles.separator} />;
};

const styles = StyleSheet.create({
  separator: {
    height: 2, // Altura da linha
    backgroundColor: '#dcdcdc', // Cor da linha (cinza claro)
    width: '100%', // Largura completa da tela
  },
});

export default SeparadorNotify;
