const CACHE_NAME = 'agendamento-cache-v2'; // <-- MUDANÇA (v1 -> v2)
const urlsToCache = [
  '/',
  '/index.html'
  // Adicione aqui outros arquivos importantes se você os tiver
];

// Evento de Instalação: Salva os arquivos no cache
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando nova versão...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// --- NOVO EVENTO DE ATIVAÇÃO ---
// Este evento limpa caches antigos (como o 'agendamento-cache-v1')
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando nova versão...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// --- EVENTO DE FETCH ATUALIZADO (Estratégia Híbrida) ---
self.addEventListener('fetch', event => {
  
  // Se for um pedido de navegação (carregar a página principal, ex: index.html)
  if (event.request.mode === 'navigate') {
    // Use a estratégia "Network First" (Rede Primeiro)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Se a rede funcionar, atualiza o cache e retorna a nova página
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            console.log('Cache de navegação atualizado:', event.request.url);
            return response;
          });
        })
        .catch(() => {
          // Se a rede falhar, pega a versão antiga do cache
          console.log('Rede falhou, servindo do cache:', event.request.url);
          return caches.match(event.request);
        })
    );
  } else {
    // Para todos os outros pedidos (imagens, scripts, fontes, etc.)
    // Use a estratégia "Cache First" (Cache Primeiro)
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Retorna do cache se existir, senão busca na rede
          return response || fetch(event.request);
        })
    );
  }
});
