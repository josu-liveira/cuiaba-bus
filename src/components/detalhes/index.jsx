// src/components/DetalhesLinha.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export function DetalhesLinha() {
  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Linha 608 - Parque Residencial</Text>

      {/* Início e Fim */}
      <View style={styles.row}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Início</Text>
          <Text style={styles.info}>Ponto Inicial 608</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Fim</Text>
          <Text style={styles.info}>Estação Alencastro</Text>
        </View>
      </View>

      {/* Linha divisória */}
      <View style={styles.divider} />

      {/* Horários */}
      <View style={styles.row}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Embarque</Text>
          <View style={styles.rowWithIcon}>
            <MaterialIcons name="directions-bus" size={20} color="#121212" />
            <Text style={styles.time}>16h45</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Chegada</Text>
          <View style={styles.rowWithIcon}>
            <MaterialIcons name="directions-bus" size={20} color="#121212" />
            <Text style={styles.time}>17h25</Text>
          </View>
        </View>
      </View>

      {/* Distância e Tempo */}
      <View style={styles.row}>
        <View style={styles.rowWithIcon}>
          <Ionicons name="location-outline" size={18} color="gray" />
          <Text style={styles.info}>12,8 Km</Text>
        </View>
        <View style={styles.rowWithIcon}>
          <Ionicons name="time-outline" size={18} color="gray" />
          <Text style={styles.info}>Em média 30min</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 12,
    color: '#888',
  },
  info: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginVertical: 8,
  },
  rowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
