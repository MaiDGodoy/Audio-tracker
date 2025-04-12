self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('audio-cache').then((cache) => {
      return cache.addAll([
        // Lista de URLs de audio
        'https://www.dropbox.com/scl/fi/jg9nx593hejrn19ocp04e/Realm-of-Tranquil-Eternity-Disc-1_-Sakura-and-Violet-ThunderGenshin-Impact.mp3?rlkey=eeac442as89tf6mvmlmuw8ulm&raw=1',
        'https://www.dropbox.com/scl/fi/n0ymferge9xacyx7bwrkx/Isabella-s-Lullaby-vocal-and-mandolin-ver.-extended.mp3?rlkey=bxk52om38bzhhewmkiq7kja1x&st=izlkdnp9&dl=1'
      ]);
    })
  );
});
