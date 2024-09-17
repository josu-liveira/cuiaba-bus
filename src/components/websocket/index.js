import React, { createContext, useState, useEffect, useContext } from 'react';

// URL do WebSocket e mensagens iniciais
const URL_WEBSOCKET = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
const MENSAGENS_INICIAIS = ['40/mapasinotico', '42/mapasinotico,["setupSubs",["_"]]'];
const PREFIXO_MENSAGEM = '42/mapasinotico,';

// Contexto para o WebSocket
const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [veiculosAtivos, setVeiculosAtivos] = useState({});
  const [informacoesLinha, setInformacoesLinha] = useState('');
  const [onibusDesligados, setOnibusDesligados] = useState(0);

  useEffect(() => {
    const socket = new WebSocket(URL_WEBSOCKET);
    let intervaloManterConexao;

    socket.onopen = () => {
      MENSAGENS_INICIAIS.forEach(mensagem => socket.send(mensagem));
      // Substitua '42/mapasinotico,["setupSubs",["_"]]' com o que você precisa
      socket.send('42/mapasinotico,["setupSubs",["_"]]');

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

    return () => {
      socket.close();
      clearInterval(intervaloManterConexao);
    };
  }, []);

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

  return (
    <WebSocketContext.Provider value={{ veiculosAtivos, informacoesLinha, onibusDesligados }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
