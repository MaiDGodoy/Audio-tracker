// Lista de reproducción con IDs de YouTube
const playlist = [
  { 
    title: "Disc 1:Inazuma", 
    artist: "Genshin Impact", 
    duration: "50:01", 
    id: "1xMRU4D9ODc",
    startSeconds: 0,
    endSeconds: 3001
  },
  { 
    title: "Isabella's Lullaby", 
    artist: "Ash", 
    duration: "7:18", 
    id: "GCSqIJGQ4Ss",
    startSeconds: 0,
    endSeconds: 438
  }
];

// Variables globales
let currentTrack = 0;
let isPlaying = false;
let isRepeat = false;
let isShuffle = false;
let player;
let progressInterval;
let isPlayerReady = false;

// Función crítica que YouTube requiere
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      enablejsapi: 1,
      origin: window.location.origin
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  isPlayerReady = true;
  initPlayer();
  console.log("Reproductor de YouTube listo");
}

function onPlayerStateChange(event) {
  switch(event.data) {
    case YT.PlayerState.PLAYING:
      isPlaying = true;
      document.getElementById('play-btn').textContent = '⏸';
      startProgressTimer();
      updatePlaylistUI();
      break;
    case YT.PlayerState.PAUSED:
      isPlaying = false;
      document.getElementById('play-btn').textContent = '▶';
      clearInterval(progressInterval);
      updatePlaylistUI();
      break;
    case YT.PlayerState.ENDED:
      handleTrackEnd();
      break;
    case YT.PlayerState.BUFFERING:
    case YT.PlayerState.CUED:
      // Estados intermedios
      break;
  }
}

function handleTrackEnd() {
  if (isRepeat) {
    playTrack(currentTrack);
  } else {
    nextTrack();
  }
}

function initPlayer() {
  if (!isPlayerReady) {
    console.error("El reproductor de YouTube no está listo");
    return;
  }

  const playlistElement = document.getElementById('playlist');
  
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
    contentDiv.innerHTML = `${track.title}<br><small>${track.artist}</small>`;
    
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
        player.pauseVideo();
      } else {
        playTrack(index);
      }
    });
    
    item.addEventListener('click', () => playTrack(index));
    playlistElement.appendChild(item);
  });

  // Configurar controles
  document.getElementById('play-btn').addEventListener('click', togglePlay);
  document.getElementById('prev-btn').addEventListener('click', prevTrack);
  document.getElementById('next-btn').addEventListener('click', nextTrack);
  document.getElementById('repeat-btn').addEventListener('click', toggleRepeat);
  document.getElementById('shuffle-btn').addEventListener('click', toggleShuffle);
  document.getElementById('progress-container').addEventListener('click', seek);

  // Actualizar UI inicial
  updatePlayerTitle();
  updateTimeDisplay(0, playlist[currentTrack].endSeconds || 300);
}

function playTrack(index) {
  if (!isPlayerReady) {
    console.error("El reproductor no está listo");
    return;
  }

  currentTrack = index;
  const track = playlist[index];
  
  player.loadVideoById({
    videoId: track.id,
    startSeconds: track.startSeconds || 0,
    endSeconds: track.endSeconds || undefined
  });
  
  updatePlayerTitle();
  updatePlaylistUI();
}

function updatePlayerTitle() {
  const currentTrackData = playlist[currentTrack];
  document.querySelector('.now-playing-title').textContent = 
    `${currentTrackData.title} - ${currentTrackData.artist}`;
}

function updatePlaylistUI() {
  document.querySelectorAll('.playlist-item').forEach((item, index) => {
    const isActive = index === currentTrack;
    item.classList.toggle('active', isActive);
    
    if (isActive) {
      item.classList.toggle('playing', isPlaying);
      item.classList.toggle('paused', !isPlaying);
    } else {
      item.classList.remove('playing', 'paused');
    }
    
    const playButton = item.querySelector('.track-play-button');
    if (playButton && isActive) {
      playButton.textContent = isPlaying ? '❚❚' : '▶';
    }
  });
}

function startProgressTimer() {
  clearInterval(progressInterval);
  progressInterval = setInterval(updateProgressBar, 1000);
  updateProgressBar(); // Actualizar inmediatamente
}

function updateProgressBar() {
  if (!isPlayerReady) return;
  
  try {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const progress = (currentTime / duration) * 100;
    
    document.getElementById('progress-bar').style.width = `${progress}%`;
    updateTimeDisplay(currentTime, duration);
  } catch (e) {
    console.error("Error al actualizar la barra de progreso:", e);
  }
}

function updateTimeDisplay(currentTime, duration) {
  document.getElementById('current-time').textContent = formatTime(currentTime);
  document.getElementById('duration').textContent = formatTime(duration);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function seek(e) {
  if (!isPlayerReady) return;
  
  try {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const duration = player.getDuration();
    const newTime = duration * percent;
    
    player.seekTo(newTime, true);
    updateTimeDisplay(newTime, duration);
  } catch (e) {
    console.error("Error al buscar:", e);
  }
}

function togglePlay() {
  if (!isPlayerReady) return;
  
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
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

// Animación de botones
document.querySelectorAll('.controls button').forEach(button => {
  button.addEventListener('click', function() {
    this.style.transform = 'scale(0.9)';
    setTimeout(() => {
      this.style.transform = 'scale(1)';
    }, 100);
  });
});

// Verificar periódicamente si el reproductor está listo
const checkPlayerReady = setInterval(() => {
  if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
    clearInterval(checkPlayerReady);
    if (!player) {
      onYouTubeIframeAPIReady();
    }
  }
}, 100);
