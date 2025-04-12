const playlist = [
    { 
      title: "Disc 1:Inazuma", 
      artist: "Genshin Impact", 
      duration: "50:01", 
      src: "https://docs.google.com/uc?export=download&id=1ptQDN-Aga_uMeIbEZyObu8r_r0GPOIkt" 
    },
    { 
      title: "Liyue Harbor", 
      artist: "HOYO-MiX", 
      duration: "4:12", 
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" 
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
  
function initPlayer() {
  const playlistElement = document.getElementById('playlist');
      updatePlayerTitle();
      document.getElementById('current-time').textContent = '0:00';
      document.getElementById('duration').textContent = '0:00';

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
        `;  // <-- Aquí quitamos la duración que estaba antes
        
        // Añadir elemento de duración
        const durationDiv = document.createElement('div');
        durationDiv.className = 'track-duration';
        durationDiv.textContent = track.duration;
        contentDiv.appendChild(durationDiv);
        
        item.appendChild(playButton);
        item.appendChild(waveIndicator);
        item.appendChild(contentDiv);
        
        playButton.addEventListener('click', (e) => {
          e.stopPropagation();
          if (currentTrack === index && isPlaying) {
            sound.pause();
          } else {
            playTrack(index);
          }
        });
        
        item.addEventListener('click', () => playTrack(index));
        playlistElement.appendChild(item);
      });

      document.getElementById('play-btn').addEventListener('click', togglePlay);
      document.getElementById('prev-btn').addEventListener('click', prevTrack);
      document.getElementById('next-btn').addEventListener('click', nextTrack);
      document.getElementById('repeat-btn').addEventListener('click', toggleRepeat);
      document.getElementById('shuffle-btn').addEventListener('click', toggleShuffle);
      document.getElementById('progress-container').addEventListener('click', seek);
    }
  
  function playTrack(index) {
    if (sound) sound.stop();
    currentTrack = index;
    sound = new Howl({
      src: [playlist[index].src],
      html5: true,
      format: ['mp3'],
      preload: 'true',
      onload: function() {
        document.getElementById('duration').textContent = formatTime(sound.duration());
            // Actualizar título al cargar
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
      // Intenta desbloquear el audio
      sound.once('unlock', function() {
        sound.play();
      });
    }
  });
  
  sound.play();
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
  
  function seek(e) {
    if (!sound) return;
    const wasPlaying = sound.playing(); // Guardar estado antes de seek
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = sound.duration() * percent;
    
    sound.seek(newTime);
    document.getElementById('progress-bar').style.width = `${percent * 100}%`;
    document.getElementById('current-time').textContent = formatTime(newTime);
    
    if (!sound.playing()) {
        updateProgressBar();
    }

    if (wasPlaying) {
        sound.play();
    } else {
        updateProgressBar(); // Forzar actualización visual si estaba pausado
    }
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

 
  
  // Iniciar
  document.addEventListener('DOMContentLoaded', initPlayer);
  window.onload = initPlayer;
