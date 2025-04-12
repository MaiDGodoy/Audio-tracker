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

let currentTrack = 0;
let isPlaying = false;
let isRepeat = false;
let isShuffle = false;
let player;
let progressInterval;
let isPlayerReady = false;

// Cargar la API de YouTube dinámicamente si no se ha cargado
if (!window.YT) {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    videoId: playlist[currentTrack].id,
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

  document.getElementById('play-btn').addEventListener('click', () => {
    if (!isPlayerReady) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  });
  document.getElementById('prev-btn').addEventListener('click', prevTrack);
  document.getElementById('next-btn').addEventListener('click', nextTrack);
  document.getElementById('repeat-btn').addEventListener('click', toggleRepeat);
  document.getElementById('shuffle-btn').addEventListener('click', toggleShuffle);
  document.getElementById('progress-container').addEventListener('click', seek);

  updatePlayerTitle();
  updateTimeDisplay(0, playlist[currentTrack].endSeconds || 300);
}

function playTrack(index) {
  if (!isPlayerReady) return;
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
  const track = playlist[currentTrack];
  document.querySelector('.now-playing-title').textContent = `${track.title} - ${track.artist}`;
}

function updatePlaylistUI() {
  document.querySelectorAll('.playlist-item').forEach((item, index) => {
    const isActive = index === currentTrack;
    item.classList.toggle('active', isActive);
    item.classList.toggle('playing', isActive && isPlaying);
    item.classList.toggle('paused', isActive && !isPlaying);
    const btn = item.querySelector('.track-play-button');
    if (btn && isActive) {
      btn.textContent = isPlaying ? '❚❚' : '▶';
    }
  });
}

function startProgressTimer() {
  clearInterval(progressInterval);
  progressInterval = setInterval(updateProgressBar, 1000);
  updateProgressBar();
}

function updateProgressBar() {
  if (!isPlayerReady) return;
  try {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const percent = (currentTime / duration) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;
    updateTimeDisplay(currentTime, duration);
  } catch (e) {
    console.error("Error al actualizar barra de progreso:", e);
  }
}

function updateTimeDisplay(current, total) {
  document.getElementById('current-time').textContent = formatTime(current);
  document.getElementById('duration').textContent = formatTime(total);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' + s : s}`;
}

function seek(e) {
  if (!isPlayerReady) return;
  try {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const duration = player.getDuration();
    player.seekTo(duration * percent, true);
  } catch (e) {
    console.error("Error al buscar:", e);
  }
}

function nextTrack() {
  const next = isShuffle ? Math.floor(Math.random() * playlist.length) : (currentTrack + 1) % playlist.length;
  playTrack(next);
}

function prevTrack() {
  const prev = currentTrack - 1 < 0 ? playlist.length - 1 : currentTrack - 1;
  playTrack(prev);
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  document.getElementById('repeat-btn').classList.toggle('active', isRepeat);
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffle-btn').classList.toggle('active', isShuffle);
}

document.querySelectorAll('.controls button').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => btn.style.transform = 'scale(1)', 100);
  });
});
