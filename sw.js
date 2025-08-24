const CACHE_NAME = 'agendamento-cache-v1';
const urlsToCache = [
  '/',
  '/index.html'
  // Adicione aqui outros arquivos importantes se você os tiver, como '/style.css'
];

// Evento de Instalação: Salva os arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Fetch: Responde com o cache se disponível, senão busca na rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna o cache
        if (response) {
          return response;
        }
        // Senão, busca na rede
        return fetch(event.request);
      })
  );
});