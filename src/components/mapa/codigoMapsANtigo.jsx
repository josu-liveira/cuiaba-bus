import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// WebSocket Configuration
const WS_URL = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
const MESSAGE_PREFIX = '42/mapasinotico,';
const INITIAL_MESSAGES = ['40/mapasinotico', '42/mapasinotico,["setupSubs",["_"]]'];
const FILTERED_LOCATIONS = [
  'Integra', 'PONTO INTEGRA', 'GARAGEM EXPRESSO NS', 'Garagem Pantanal', 'Garagem Vpar', 'Garagem Uni', 'Posto 13',
  'TUT TRANSPORTE', 'BRIDSTONE', 'VIA VAREJO', 'PF -P', 'GARAGEM 1 PANTANAL'
];

const Mapa = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [veiculosAtivos, setVeiculosAtivos] = useState({});
  const [infoLinha, setInfoLinha] = useState('');
  const [onibusDesligados, setOnibusDesligados] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }, 1000);
      }

      // Obter dados dos veículos
      fetchVeiculos('42/mapasinotico,["setupSubs",["565f12fd08b8148e31179aaf:565f12fd08b8148e31179aad:*","565f12fd08b8148e31179aaf:565f12fd08b8148e31179aae:*"]]', '608');
    };

    getLocation();
  }, []);

  const fetchVeiculos = (req, linha) => {
    const socket = new WebSocket(WS_URL);
    let keepAliveInterval;

    socket.onopen = () => {
      console.log(`Linha ${linha} consultada`);
      INITIAL_MESSAGES.forEach(message => socket.send(message));
      socket.send(req);

      // Manter a conexão viva enviando requisição "2" a cada 7 segundos
      keepAliveInterval = setInterval(() => {
        socket.send('2');
      }, 7000);
    };

    socket.onmessage = (event) => {
      const message = event.data.toString();
      processWebSocketMessage(message);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      clearInterval(keepAliveInterval);
      console.log('Conexão WebSocket fechada');
    };
  };

  const processWebSocketMessage = (message) => {
    if (message.startsWith(MESSAGE_PREFIX)) {
      const jsonString = message.slice(MESSAGE_PREFIX.length);
      try {
        const parsedData = JSON.parse(jsonString);
        if (Array.isArray(parsedData) && parsedData.length >= 2) {
          const [action, data] = parsedData;
          let veiculos;

          if (action === 'sync') {
            veiculos = data?.data || [];
          } else if (action === 'update' || action === 'insert') {
            veiculos = [data];
          } else {
            console.warn(`Ação desconhecida: ${action}`);
            return;
          }

          const result = processVehicleData(veiculos);
          setInfoLinha(result.infoLinha);
          setVeiculosAtivos(prev => {
            const updatedVeiculos = { ...prev };
            result.veiculosAtivos.forEach(veiculo => {
              updatedVeiculos[veiculo.prefixoVeiculo] = veiculo;
            });
            return updatedVeiculos;
          });
          setOnibusDesligados(result.onibusDesligados);
        }
      } catch (error) {
        console.error('Erro ao analisar a mensagem JSON:', error);
      }
    }
  };

  const processVehicleData = (veiculos) => {
    let infoLinha = '';
    let veiculosAtivos = [];
    let onibusDesligados = 0;

    veiculos.forEach(veiculo => {
      const { sinotico, pontoMaisProximo, velocidadeAtual, prefixoVeiculo, gps } = veiculo;

      if (sinotico) {
        const { nomeLinha } = sinotico;
        infoLinha = `LINHA ${nomeLinha}`;
      }

      if (sinotico && pontoMaisProximo && velocidadeAtual !== undefined && prefixoVeiculo) {
        if (FILTERED_LOCATIONS.some(location => pontoMaisProximo.startsWith(location))) {
          onibusDesligados++;
        } else {
          const { nomeTrajeto } = sinotico;
          const latitude = gps?.latitude;
          const longitude = gps?.longitude;

          veiculosAtivos.push({
            prefixoVeiculo,
            nomeTrajeto,
            pontoMaisProximo,
            velocidadeAtual,
            latitude,
            longitude
          });
        }
      }
    });

    return {
      infoLinha,
      veiculosAtivos,
      onibusDesligados,
      mensagemStatus: veiculosAtivos.length === 0 ? 'Não existem ônibus disponíveis no momento.' : ''
    };
  };

  const getMarkerColor = (nomeTrajeto) => {
    return nomeTrajeto.includes('IDA') ? 'blue' : 'red';
  };

  const handleCenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={false}
        customMapStyle={osmStyle}
        mapType="standard"
      >
        {Object.values(veiculosAtivos).map((veiculo) => (
          <Marker
            key={veiculo.prefixoVeiculo}
            coordinate={{ latitude: veiculo.latitude, longitude: veiculo.longitude }}
            title={`Veículo ${veiculo.prefixoVeiculo}`}
            description={`${veiculo.nomeTrajeto} - Velocidade: ${veiculo.velocidadeAtual} km/h`}
            pinColor={getMarkerColor(veiculo.nomeTrajeto)}
          />
        ))}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        )}
      </MapView>
      <TouchableOpacity style={styles.button} onPress={handleCenterMap}>
        <Icon name="location-sharp" size={20} color="#fff" />
      </TouchableOpacity>
      <View style={styles.infoBox}>
        <Text>{infoLinha}</Text>
        <Text>{onibusDesligados} ônibus desligados.</Text>
      </View>
    </View>
  );
};

const osmStyle = [
  // Adicione seu estilo OSM aqui, se desejar
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
  },
  
  button: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  infoBox: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
});

export default Mapa;
