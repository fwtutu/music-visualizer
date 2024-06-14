const audioElement = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const waveColorInput = document.getElementById('waveColor');
const waveTypeSelect = document.getElementById('waveType');
const waveWidthInput = document.getElementById('waveWidth');


// 處理檔案上傳
fileInput.addEventListener('change', function() {
    const file = this.files[0];
    const url = URL.createObjectURL(file);
    audioElement.src = url;
});

// 播放/暫停音樂
playBtn.addEventListener('click', function() {
    if (audioElement.paused) {
        audioElement.play();
        playBtn.textContent = '暫停';
    } else {
        audioElement.pause();
        playBtn.textContent = '播放';
    }
});

// 更新進度條
audioElement.addEventListener('timeupdate', function() {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    progressBar.value = progress;
});

// 拖曳進度條
progressBar.addEventListener('input', function() {
    const seekTime = (audioElement.duration * this.value) / 100;
    audioElement.currentTime = seekTime;
});

// 初始化波型樣式
let waveColor = waveColorInput.value;
let waveType = waveTypeSelect.value;
let waveWidth = waveWidthInput.value;

// 繪製波型
function drawWave() {
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
        requestAnimationFrame(animate);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / bufferLength * waveWidth;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 255 * canvas.height;
            ctx.fillStyle = waveColor;

            switch (waveType) {
                case 'bar':
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    break;
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(x, canvas.height);
                    ctx.lineTo(x, canvas.height - barHeight);
                    ctx.strokeStyle = waveColor; // 設置線條顏色
                    ctx.stroke();
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(x, canvas.height, barHeight / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    break;
            }

            x += barWidth + 1;
        }
    }

    animate();
}


// 監聽自訂樣式變更
waveColorInput.addEventListener('input', () => {
    waveColor = waveColorInput.value;
});

waveTypeSelect.addEventListener('change', () => {
    waveType = waveTypeSelect.value;
});

waveWidthInput.addEventListener('input', () => {
    waveWidth = waveWidthInput.value;
});


audioElement.addEventListener('play', drawWave);