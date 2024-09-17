import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { obterMapa } from './mapaLeaflet';

const { width, height } = Dimensions.get('window');

const URL_WEBSOCKET = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
const PREFIXO_MENSAGEM = '42/mapasinotico,';
const MENSAGENS_INICIAIS = ['40/mapasinotico', '42/mapasinotico,["setupSubs",["_"]]'];
const LOCALIZACOES_FILTRADAS = [
  'Integra', 'PONTO INTEGRA', 'GARAGEM EXPRESSO NS', 'Garagem Pantanal', 'Garagem Vpar', 'Garagem Uni', 'Posto 13',
  'TUT TRANSPORTE', 'BRIDSTONE', 'VIA VAREJO', 'PF -P', 'GARAGEM 1 PANTANAL'
];

const Mapa = () => {
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [veiculosAtivos, setVeiculosAtivos] = useState({});
  const [informacoesLinha, setInformacoesLinha] = useState('');
  const [onibusDesligados, setOnibusDesligados] = useState(0);
  const webViewRef = useRef(null);
  const marcadores = useRef({});  // Referência aos marcadores atuais

  useEffect(() => {
    const obterLocalizacao = async () => {
      buscarVeiculos('42/mapasinotico,["setupSubs",["565f12fd08b8148e31179aaf:565f12fd08b8148e31179aad:*","565f12fd08b8148e31179aae:*"]]', '608');
    };

    obterLocalizacao();
  }, []);

  const buscarVeiculos = (solicitacao, linha) => {
    const socket = new WebSocket(URL_WEBSOCKET);
    let intervaloManterConexao;

    socket.onopen = () => {
      console.log(`Linha ${linha} consultada`);
      MENSAGENS_INICIAIS.forEach(mensagem => socket.send(mensagem));
      socket.send(solicitacao);

      intervaloManterConexao = setInterval(() => {
        socket.send('2');
      }, 7000);
    };

    socket.onmessage = (event) => {
      const mensagem = event.data.toString();
      processarMensagemWebSocket(mensagem);
    };

    socket.onerror = (erro) => {
      console.error('Erro no WebSocket:', erro);
    };

    socket.onclose = () => {
      clearInterval(intervaloManterConexao);
      console.log('Conexão WebSocket fechada');
    };
  };

  const processarMensagemWebSocket = (mensagem) => {
    if (mensagem.startsWith(PREFIXO_MENSAGEM)) {
      const stringJson = mensagem.slice(PREFIXO_MENSAGEM.length);
      try {
        const dadosParseados = JSON.parse(stringJson);
        if (Array.isArray(dadosParseados) && dadosParseados.length >= 2) {
          const [acao, dados] = dadosParseados;
          let veiculos;

          if (acao === 'sync') {
            veiculos = dados?.data || [];
          } else if (acao === 'update' || acao === 'insert') {
            veiculos = [dados];
          } else {
            console.warn(`Ação desconhecida: ${acao}`);
            return;
          }

          const resultado = processarDadosVeiculos(veiculos);
          setInformacoesLinha(resultado.informacoesLinha);
          setVeiculosAtivos(prev => {
            const veiculosAtualizados = { ...prev };
            resultado.veiculosAtivos.forEach(veiculo => {
              veiculosAtualizados[veiculo.prefixoVeiculo] = veiculo;
            });
            return veiculosAtualizados;
          });
          setOnibusDesligados(resultado.onibusDesligados);

          // Atualizar ou adicionar marcadores no mapa
          atualizarMarcadoresMapa(resultado.veiculosAtivos);
        }
      } catch (erro) {
        console.error('Erro ao analisar a mensagem JSON:', erro);
      }
    }
  };

  const processarDadosVeiculos = (veiculos) => {
    let informacoesLinha = '';
    let veiculosAtivos = [];
    let onibusDesligados = 0;

    veiculos.forEach(veiculo => {
      const { sinotico, pontoMaisProximo, velocidadeAtual, prefixoVeiculo, gps } = veiculo;

      if (sinotico) {
        const { nomeLinha } = sinotico;
        informacoesLinha = `LINHA ${nomeLinha}`;
      }

      if (sinotico && pontoMaisProximo && velocidadeAtual !== undefined && prefixoVeiculo) {
        if (LOCALIZACOES_FILTRADAS.some(localizacao => pontoMaisProximo.startsWith(localizacao))) {
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
      informacoesLinha,
      veiculosAtivos,
      onibusDesligados,
      mensagemStatus: veiculosAtivos.length === 0 ? 'Não existem ônibus disponíveis no momento.' : ''
    };
  };

  const atualizarMarcadoresMapa = (veiculos) => {
    veiculos.forEach(veiculo => {
      const { prefixoVeiculo, latitude, longitude, nomeTrajeto, velocidadeAtual, sentido } = veiculo;
      
      // Verifica se já existe um marcador com o prefixo do veículo
      if (marcadores.current[prefixoVeiculo]) {
        // Atualiza a posição do marcador existente
        webViewRef.current?.injectJavaScript(`
          atualizarMarcador('${prefixoVeiculo}', ${latitude}, ${longitude}, '${nomeTrajeto}', ${velocidadeAtual}, '${sentido}');
        `);
      } else {
        // Adiciona um novo marcador
        webViewRef.current?.injectJavaScript(`
          adicionarMarcador('${prefixoVeiculo}', ${latitude}, ${longitude}, '${nomeTrajeto}', ${velocidadeAtual}, '${sentido}');
        `);
        marcadores.current[prefixoVeiculo] = true; // Marca como existente
      }
    });
  };

  return (
    <View style={estilos.container}>
      <WebView
        ref={webViewRef}
        style={estilos.mapa}
        source={{ html: obterMapa() }}
        javaScriptEnabled={true}
      />
      <View style={estilos.infoBox}>
        <Text>{informacoesLinha}</Text>
        <Text>{onibusDesligados} ônibus desligados.</Text>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  
  mapa: {
    width: width,
    height: height,
  },

  infoBox: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    elevation: 5
  },
});

export default Mapa;
