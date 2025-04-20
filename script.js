const playlist = [
  { title: "LoFi Radio", src: "https://streams.ilovemusic.de/iloveradio1.mp3" },
  { title: "Classic Hits", src: "https://streams.ilovemusic.de/iloveradio2.mp3" },
  { title: "Hip-Hop Radio", src: "https://streams.ilovemusic.de/iloveradio3.mp3" }
];

let currentIndex = 0;
let isShuffle = false;

const player = document.getElementById('audioPlayer');
const title = document.getElementById('trackTitle');
const volumeSlider = document.getElementById('volumeControl');
const progressBar = document.getElementById('progressBar');
const shuffleBtn = document.getElementById('shuffleBtn');

function playTrack(index) {
  currentIndex = index;
  player.src = playlist[index].src;
  title.textContent = playlist[index].title;
  player.play();
}

player.addEventListener('ended', () => {
  if (isShuffle) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } while (nextIndex === currentIndex);
    playTrack(nextIndex);
  } else {
    playTrack((currentIndex + 1) % playlist.length);
  }
});

player.addEventListener('timeupdate', () => {
  if (player.duration) {
    const percent = (player.currentTime / player.duration) * 100;
    progressBar.style.width = percent + "%";
  }
});

volumeSlider.addEventListener('input', () => {
  player.volume = volumeSlider.value;
});

shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('btn-warning', isShuffle);
  shuffleBtn.textContent = isShuffle ? '🔀 Shuffle: On' : '▶️ Shuffle: Off';
});

// Start with first track
playTrack(currentIndex);


const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');

player.addEventListener('loadedmetadata', () => {
  durationTimeEl.textContent = formatTime(player.duration);
});

player.addEventListener('timeupdate', () => {
  currentTimeEl.textContent = formatTime(player.currentTime);
});

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  return \`\${minutes}:\${seconds}\`;
}


const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(player);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 64;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const barWidth = (canvas.width / bufferLength) * 1.5;
  let x = 0;

  dataArray.forEach((val) => {
    const barHeight = val / 2;
    ctx.fillStyle = "rgba(0, 123, 255, 0.7)";
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  });
}

player.onplay = () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  drawVisualizer();
};
