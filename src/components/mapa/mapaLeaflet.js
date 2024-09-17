export const obterMapa = () => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <style>
      /* Estilos adicionais para garantir que o mapa ocupe toda a tela */
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
      #map {
        width: 100%;
        height: 100%;
      }
    </style>
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script>
  var map = L.map('map', { zoomControl: false }).setView([-15.6014109, -56.0978917], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var iconIda = L.icon({
    iconUrl: 'https://mapaexternolinha.zn5.m2mcontrol.com.br/img/icones_mapa/veiculo/blue.png',
    iconSize: [25, 26],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37],
  });

  var iconVolta = L.icon({
    iconUrl: 'https://mapaexternolinha.zn5.m2mcontrol.com.br/img/icones_mapa/veiculo/green.png',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37],
  });

  var marcadores = {};

  function adicionarMarcador(prefixo, latitude, longitude, trajeto, velocidade, sentido) {
    if (!latitude || !longitude) return;

    var icon = sentido === 'IDA' ? iconIda : iconVolta;

    var marker = L.marker([latitude, longitude], { icon: icon }).addTo(map);
    marker.bindPopup(
      "<b>Prefixo:</b> " + prefixo + "<br><b>Trajeto:</b> " + trajeto + "<br><b>Velocidade:</b> " + velocidade + " km/h"
    );
    marcadores[prefixo] = marker;
  }

  function animarMarcador(marker, newLatLng, duration) {
    if (!marker) return;

    var startLatLng = marker.getLatLng();
    var startTime = performance.now();

    function step(timestamp) {
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1); // Normaliza o progresso para [0, 1]

      var currentLat = startLatLng.lat + (newLatLng.lat - startLatLng.lat) * progress;
      var currentLng = startLatLng.lng + (newLatLng.lng - startLatLng.lng) * progress;

      marker.setLatLng([currentLat, currentLng]);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function atualizarMarcador(prefixo, latitude, longitude, trajeto, velocidade, sentido) {
    if (marcadores[prefixo]) {
      var newLatLng = L.latLng(latitude, longitude);
      animarMarcador(marcadores[prefixo], newLatLng, 1000); // 1000ms de duração da animação

      marcadores[prefixo].setPopupContent(
        "<b>Prefixo:</b> " + prefixo + "<br><b>Trajeto:</b> " + trajeto + "<br><b>Velocidade:</b> " + velocidade + " km/h"
      );

      var icon = sentido === 'IDA' ? iconIda : iconVolta;
      marcadores[prefixo].setIcon(icon);
    } else {
      adicionarMarcador(prefixo, latitude, longitude, trajeto, velocidade, sentido);
    }
  }

  window.adicionarMarcador = adicionarMarcador;
  window.atualizarMarcador = atualizarMarcador;
</script>

  </head>
  <body>
    <div id="map"></div>

    <script>
      var map = L.map('map', { zoomControl: false }).setView([-15.6014109, -56.0978917], 13);

      // Adicionar camada do mapa
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Definição dos ícones personalizados
      var iconIda = L.icon({
        iconUrl: 'https://mapaexternolinha.zn5.m2mcontrol.com.br/img/icones_mapa/veiculo/blue.png',
        iconSize: [25, 26], // Tamanho do ícone
        iconAnchor: [16, 37], // Ponto de ancoragem
        popupAnchor: [0, -37], // Onde a popup será exibida em relação ao ícone
      });

      var iconVolta = L.icon({
        iconUrl: 'https://mapaexternolinha.zn5.m2mcontrol.com.br/img/icones_mapa/veiculo/green.png',
        iconSize: [32, 37],
        iconAnchor: [16, 37],
        popupAnchor: [0, -37],
      });

      // Objeto para manter a referência dos marcadores
      var marcadores = {};

      // Função para adicionar um novo marcador
      function adicionarMarcador(prefixo, latitude, longitude, trajeto, velocidade, sentido) {
        if (!latitude || !longitude) return; // Verifica se as coordenadas são válidas

        // Escolhe o ícone com base no sentido (IDA ou VOLTA)
        var icon = sentido === 'IDA' ? iconIda : iconVolta;

        var marker = L.marker([latitude, longitude], { icon: icon }).addTo(map);
        marker.bindPopup(
          "<b>Prefixo:</b> " + prefixo + "<br><b>Trajeto:</b> " + trajeto + "<br><b>Velocidade:</b> " + velocidade + " km/h"
        );
        marcadores[prefixo] = marker; // Guarda o marcador no objeto
      }

      // Função para atualizar um marcador existente
      function atualizarMarcador(prefixo, latitude, longitude, trajeto, velocidade, sentido) {
        if (marcadores[prefixo]) {
          // Atualiza a posição do marcador
          marcadores[prefixo].setLatLng([latitude, longitude]);
          // Atualiza o conteúdo do popup
          marcadores[prefixo].setPopupContent(
            "<b>Prefixo:</b> " + prefixo + "<br><b>Trajeto:</b> " + trajeto + "<br><b>Velocidade:</b> " + velocidade + " km/h"
          );

          // Atualiza o ícone com base no sentido (IDA ou VOLTA)
          var icon = sentido === 'IDA' ? iconIda : iconVolta;
          marcadores[prefixo].setIcon(icon);
        } else {
          // Caso o marcador não exista, adiciona um novo
          adicionarMarcador(prefixo, latitude, longitude, trajeto, velocidade, sentido);
        }
      }

      // Funções acessíveis pela WebView
      window.adicionarMarcador = adicionarMarcador;
      window.atualizarMarcador = atualizarMarcador;
    </script>
  </body>
  </html>
`;
