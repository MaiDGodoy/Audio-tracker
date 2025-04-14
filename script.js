const playlist = [
    { 
      title: "Disc 1:Inazuma", 
      artist: "Genshin Impact", 
      duration: "50:01", 
      src:"https://dl.dropboxusercontent.com/scl/fi/jg9nx593hejrn19ocp04e/Realm-of-Tranquil-Eternity-Disc-1_-Sakura-and-Violet-ThunderGenshin-Impact.mp3?rlkey=eeac442as89tf6mvmlmuw8ulm&raw=1"
    },
    { 
      title: "Isabella's Lullaby", 
      artist: "Ash", 
      duration: "7:18", 
      src: "https://dl.dropboxusercontent.com/scl/fi/n0ymferge9xacyx7bwrkx/Isabella-s-Lullaby-vocal-and-mandolin-ver.-extended.mp3?rlkey=bxk52om38bzhhewmkiq7kja1x&raw=1" 
    }
  ];
  
  let currentTrack = 0;
  let isPlaying = false;
  let isRepeat = false;
  let isShuffle = false;
  let sound;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;

}
  

function initializeMusicPlayer() {
  initPlayer();
  initVolumeControls();
  preloadFirstTrack();
}

// Inicializar controles de volumen
function initVolumeControls() {
  const volumeBtn = document.getElementById('volume-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeIcon = volumeBtn.querySelector('i');
  let lastVolume = 0.7;

  volumeSlider.value = lastVolume;
  updateVolumeIcon(volumeSlider.value);

  volumeSlider.addEventListener('input', function() {
      const volume = parseFloat(this.value);
      if (sound) {
          sound.volume(volume);
          lastVolume = volume;
      }
      updateVolumeIcon(volume);
  });

  volumeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!sound) return;

      if (sound.volume() > 0) {
          lastVolume = sound.volume();
          sound.volume(0);
          volumeSlider.value = 0;
      } else {
          sound.volume(lastVolume);
          volumeSlider.value = lastVolume;
      }
      updateVolumeIcon(sound.volume());
  });

  function updateVolumeIcon(volume) {
      volume = parseFloat(volume);
      if (volume === 0) {
          volumeIcon.className = 'fas fa-volume-mute';
          volumeIcon.style.color = '#ff6b6b';
      } else if (volume < 0.5) {
          volumeIcon.className = 'fas fa-volume-down';
          volumeIcon.style.color = '#ffefaf';
      } else {
          volumeIcon.className = 'fas fa-volume-up';
          volumeIcon.style.color = '#ffefaf';
      }
  }
}



document.getElementById('volume-btn').addEventListener('click', () => {
  const container = document.querySelector('.volume-slider-container');
  container.classList.toggle('show');
});

// Precargar primer track
function preloadFirstTrack() {
  new Howl({
      src: [playlist[0].src],
      html5: true,
      preload: true,
      volume: 0,
      onload: function() {
          console.log("Track precargado!");
      }
  });
}




function initPlayer() {
  const playlistElement = document.getElementById('playlist');
  updatePlayerTitle();
  document.getElementById('current-time').textContent = '0:00';
  document.getElementById('duration').textContent = '0:00';

  const preloadSound = new Howl({
    src: [playlist[0].src],
    html5: true,
    preload: true,
    volume: 0,
    onload: function() {
      console.log("Track precargado!");
    }
  });

  playlist.forEach((track, index) => {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    
    const playButton = document.createElement('button');
    playButton.className = 'track-play-button';
    playButton.innerHTML = '▶';
    
    const waveIndicator = document.createElement('div');
    waveIndicator.className = 'track-playing-indicator';
    waveIndicator.innerHTML = '<span></span><span></span><span></span>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'track-content';
    contentDiv.innerHTML = `
      ${track.title}<br>
      <small>${track.artist}</small>
    `;
    
    const durationDiv = document.createElement('div');
    durationDiv.className = 'track-duration';
    durationDiv.textContent = track.duration;
    contentDiv.appendChild(durationDiv);
    
    item.appendChild(playButton);
    item.appendChild(waveIndicator);
    item.appendChild(contentDiv);
    
    playButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentTrack === index) {
        if (isPlaying) {
          sound.pause();
        } else {
          sound.play();
        }
      } else {
        playTrack(index);
      }
      updatePlaylistUI();
    });
    
    item.addEventListener('click', () => {
      if (currentTrack === index && isPlaying) {
        sound.pause();
      } else {
        playTrack(index);
      }
      updatePlaylistUI();
    });
    
    playlistElement.appendChild(item);
  });

  // Configuración de eventos de los controles principales
  document.getElementById('play-btn').addEventListener('click', togglePlay);
  document.getElementById('prev-btn').addEventListener('click', prevTrack);
  document.getElementById('next-btn').addEventListener('click', nextTrack);
  document.getElementById('repeat-btn').addEventListener('click', toggleRepeat);
  document.getElementById('shuffle-btn').addEventListener('click', toggleShuffle);
  document.getElementById('progress-container').addEventListener('click', seek);

  // Configuración de arrastre de la barra de progreso
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  let isDragging = false;

  const handleSeek = (e) => {
    if (!sound || !isDragging) return;
    
    const rect = progressContainer.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    
    const newTime = sound.duration() * percent;
    sound.seek(newTime);
    progressBar.style.width = `${percent * 100}%`;
    document.getElementById('current-time').textContent = formatTime(newTime);
  };

  const startDrag = (e) => {
    isDragging = true;
    progressContainer.classList.add('dragging');
    handleSeek(e);
  };

  const endDrag = () => {
    if (isDragging) {
      isDragging = false;
      progressContainer.classList.remove('dragging');
    }
  };

  // Event listeners para mouse
  progressContainer.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', handleSeek);
  document.addEventListener('mouseup', endDrag);

  // Event listeners para pantallas táctiles
  progressContainer.addEventListener('touchstart', startDrag);
  document.addEventListener('touchmove', handleSeek);
  document.addEventListener('touchend', endDrag);

  // Prevenir comportamiento por defecto en eventos táctiles
  progressContainer.addEventListener('touchstart', (e) => e.preventDefault());
}
  
  function playTrack(index) {
    if (sound) sound.stop();
    currentTrack = index;
    sound = new Howl({
      src: [playlist[index].src],
      html5: true,
      format: ['mp3'],
      preload: 'auto',
        xhr: {
      method: 'GET',
      headers: {'Origin': window.location.origin},
      withCredentials: false
    },
    onload: function() {
      document.getElementById('duration').textContent = formatTime(sound.duration());
      updatePlayerTitle();
    },
    onplay: () => {
      isPlaying = true;
      document.getElementById('play-btn').textContent = '⏸';
      updatePlaylistUI();
      updateProgressBar();
    },
    onpause: () => {
      isPlaying = false;
      document.getElementById('play-btn').textContent = '▶';
      updatePlaylistUI();
    },
    onend: () => {
      if (isRepeat) playTrack(currentTrack);
      else nextTrack();
    },
    onplayerror: function() {
      console.error("Error al reproducir, intentando desbloquear...");
      sound.once('unlock', function() {
        sound.play();
      });
    }
  });
  
  // Intenta reproducir inmediatamente
  const playAttempt = sound.play();
  
  // Si falla por políticas de autoplay
  if (typeof playAttempt !== 'number') {
    playAttempt.then(() => {
      console.log("Reproducción desbloqueada!");
    }).catch(err => {
      console.error("Error de autoplay:", err);
      // Muestra un botón de "Click para reproducir"
    });
  }
}


  
  function updatePlayerTitle() {
    const currentTrackData = playlist[currentTrack];
    document.querySelector('.music-player h2').textContent = 
        `${currentTrackData.title} - ${currentTrackData.artist}`;
}


  function updatePlaylistUI() {
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
      const isActive = index === currentTrack;
      item.classList.toggle('active', isActive);
      
      if (isActive) {
          if (isPlaying) {
              item.classList.add('playing');
              item.classList.remove('paused');
          } else {
              item.classList.add('paused');
              item.classList.remove('playing');
          }
      } else {
          item.classList.remove('playing', 'paused');
      }
      
      // Actualizar el texto del botón de play/pausa
      const playButton = item.querySelector('.track-play-button');
      if (playButton && isActive) {
          playButton.textContent = isPlaying ? '❚❚' : '▶';
      }
  });
}


  
  function updateProgressBar() {
    if (sound) {
        const currentTime = sound.seek();
        const duration = sound.duration();
        const progress = (currentTime / duration) * 100;
        
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('current-time').textContent = formatTime(currentTime);
        
        // Actualizar duración si es necesario
        if (duration && !isNaN(duration)) {
            document.getElementById('duration').textContent = formatTime(duration);
        }

        if (sound.playing()) {
            requestAnimationFrame(updateProgressBar);
        }
    }
}
  
 // REEMPLAZA TU FUNCIÓN seek Y AGREGA ESTE CÓDIGO:

let isSeeking = false;

function seek(e) {
  if (!sound || !isSeeking) return;
  
  const rect = e.currentTarget.getBoundingClientRect();
  let percent = (e.clientX - rect.left) / rect.width;
  percent = Math.max(0, Math.min(1, percent)); // Asegurar que esté entre 0 y 1
  
  const newTime = sound.duration() * percent;
  sound.seek(newTime);
  document.getElementById('progress-bar').style.width = `${percent * 100}%`;
  document.getElementById('current-time').textContent = formatTime(newTime);
}
  
  function togglePlay() {
    if (isPlaying) {
      sound.pause();
  } else {
      sound.play();
  }
  updatePlaylistUI();
}
  
  function nextTrack() {
    let nextIndex = isShuffle ? Math.floor(Math.random() * playlist.length) : (currentTrack + 1) % playlist.length;
    playTrack(nextIndex);
  }
  
  function prevTrack() {
    let prevIndex = currentTrack - 1 < 0 ? playlist.length - 1 : currentTrack - 1;
    playTrack(prevIndex);
  }
  
  function toggleRepeat() {
    isRepeat = !isRepeat;
    const btn = document.getElementById('repeat-btn');
    btn.classList.toggle('active', isRepeat);
  }
  
  function toggleShuffle() {
    isShuffle = !isShuffle;
    const btn = document.getElementById('shuffle-btn');
    btn.classList.toggle('active', isShuffle);
  }
  
  // Animación al hacer clic en cualquier botón
  document.querySelectorAll('.controls button').forEach(button => {
    button.addEventListener('click', function() {
      this.style.transform = 'scale(0.9)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 100);
    });
  });

  let isDragging = false;

  const progressContainer = document.getElementById('progress-container');
  
  progressContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      seek(e);
  });
  
  document.addEventListener('mousemove', (e) => {
      if (isDragging) {
          seek(e);
      }
  });
  
  document.addEventListener('mouseup', () => {
      if (isDragging) {
          isDragging = false;
      }
  });




// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeMusicPlayer);
