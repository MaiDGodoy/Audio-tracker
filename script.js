const playlist = [
  { 
    title: "Disc 1:Inazuma", 
    artist: "Genshin Impact", 
    duration: "50:01", 
    id: "1xMRU4D9ODc" // Solo el ID del video de YouTube
  },
  { 
    title: "Isabella's Lullaby", 
    artist: "Ash", 
    duration: "7:18", 
    id: "GCSqIJGQ4Ss" // Solo el ID del video de YouTube
  }
];

let currentTrack = 0;
let isPlaying = false;
let isRepeat = false;
let isShuffle = false;
let player;
let progressInterval;

// Inicializar el reproductor de YouTube
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady() {
  initPlayer();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    document.getElementById('play-btn').textContent = '⏸';
    startProgressTimer();
    updatePlaylistUI();
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
    document.getElementById('play-btn').textContent = '▶';
    clearInterval(progressInterval);
    updatePlaylistUI();
  } else if (event.data === YT.PlayerState.ENDED) {
    if (isRepeat) {
      playTrack(currentTrack);
    } else {
      nextTrack();
    }
  }
}

function initPlayer() {
  const playlistElement = document.getElementById('playlist');
  updatePlayerTitle();
  
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
}

function playTrack(index) {
  currentTrack = index;
  player.loadVideoById(playlist[index].id);
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
    
    const playButton = item.querySelector('.track-play-button');
    if (playButton && isActive) {
      playButton.textContent = isPlaying ? '❚❚' : '▶';
    }
  });
}

function startProgressTimer() {
  clearInterval(progressInterval);
  progressInterval = setInterval(updateProgressBar, 1000);
}

function updateProgressBar() {
  if (player && player.getCurrentTime) {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const progress = (currentTime / duration) * 100;
    
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('current-time').textContent = formatTime(currentTime);
    document.getElementById('duration').textContent = formatTime(duration);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function seek(e) {
  if (!player || !player.getDuration) return;
  
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = player.getDuration() * percent;
  
  player.seekTo(newTime);
  updateProgressBar();
}

function togglePlay() {
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

// Animación al hacer clic en cualquier botón
document.querySelectorAll('.controls button').forEach(button => {
  button.addEventListener('click', function() {
    this.style.transform = 'scale(0.9)';
    setTimeout(() => {
      this.style.transform = 'scale(1)';
    }, 100);
  });
});
