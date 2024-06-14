const audioElement = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 自訂波型樣式選項
const waveColorInput = document.getElementById('waveColor');
const waveTypeSelect = document.getElementById('waveType');
const waveWidthInput = document.getElementById('waveWidth');
const waveOpacityInput = document.getElementById('waveOpacity');
const waveHeightInput = document.getElementById('waveHeight');
const waveSmoothingInput = document.getElementById('waveSmoothing');
const waveGradientStartInput = document.getElementById('waveGradientStart');
const waveGradientEndInput = document.getElementById('waveGradientEnd');
const waveAnimationSelect = document.getElementById('waveAnimation');
const savePresetBtn = document.getElementById('savePreset');
const presetSelect = document.getElementById('presetSelect');
const loadPresetBtn = document.getElementById('loadPreset');
const codeEditor = document.getElementById('codeEditor');
const visualizationModeSelect = document.getElementById('visualizationMode');

// 初始化波型樣式
let waveColor = waveColorInput.value;
let waveType = waveTypeSelect.value;
let waveWidth = waveWidthInput.value;
let waveOpacity = waveOpacityInput.value;
let waveHeight = waveHeightInput.value;
let waveSmoothing = waveSmoothingInput.checked;
let waveGradientStart = waveGradientStartInput.value;
let waveGradientEnd = waveGradientEndInput.value;
let waveAnimation = waveAnimationSelect.value;
let presets = {};
let visualizationMode = visualizationModeSelect.value;

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
        audioElement.pause();playBtn.textContent = '播放';
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
            const barHeight = (dataArray[i] / 255) * (waveHeight / canvas.height) * canvas.height;
            let gradient;

            if (waveGradientStart !== waveGradientEnd) {
                gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, waveGradientStart);
                gradient.addColorStop(1, waveGradientEnd);
            }

            ctx.fillStyle = gradient || waveColor;
            ctx.globalAlpha = waveOpacity;

            switch (waveType) {
                case 'bar':
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    break;
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(x, canvas.height);
                    ctx.lineTo(x, canvas.height - barHeight);
                    ctx.strokeStyle = gradient || waveColor;
                    ctx.stroke();
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(x, canvas.height, barHeight / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    break;
            }

            if (waveSmoothing) {
                // 應用平滑處理
            }

            x += barWidth + 1;
        }

        // 應用動畫效果
        switch (waveAnimation) {
            case 'flash':
                // 實現閃爍效果
                break;
            case 'shift':
                // 實現平移效果
                break;
        }
    }

    animate();
}

// 監聽自訂樣式變更
waveColorInput.addEventListener('input', updateWaveStyle);
waveTypeSelect.addEventListener('change', updateWaveStyle);
waveWidthInput.addEventListener('input', updateWaveStyle);
waveOpacityInput.addEventListener('input', updateWaveStyle);
waveHeightInput.addEventListener('input', updateWaveStyle);
waveSmoothingInput.addEventListener('change', updateWaveStyle);
waveGradientStartInput.addEventListener('input', updateWaveStyle);
waveGradientEndInput.addEventListener('input', updateWaveStyle);
waveAnimationSelect.addEventListener('change', updateWaveStyle);

// 更新波型樣式
function updateWaveStyle() {
    waveColor = waveColorInput.value;
    waveType = waveTypeSelect.value;
    waveWidth = waveWidthInput.value;
    waveOpacity = waveOpacityInput.value;
    waveHeight = waveHeightInput.value;
    waveSmoothing = waveSmoothingInput.checked;
    waveGradientStart = waveGradientStartInput.value;
    waveGradientEnd = waveGradientEndInput.value;
    waveAnimation = waveAnimationSelect.value;
}

// 保存預設樣式
savePresetBtn.addEventListener('click', function() {
    const presetName = prompt('請輸入預設樣式名稱:');
    if (presetName) {
        const preset = {
            waveColor,
            waveType,
            waveWidth,
            waveOpacity,
            waveHeight,
            waveSmoothing,
            waveGradientStart,
            waveGradientEnd,
            waveAnimation
        };
        presets[presetName] = preset;
        presetSelect.options.length = 0;
        for (const name in presets) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            presetSelect.add(option);
        }
    }
});

// 載入預設樣式
loadPresetBtn.addEventListener('click', function() {
    const presetName = presetSelect.value;
    if (presetName) {
        const preset = presets[presetName];
        waveColorInput.value = preset.waveColor;
        waveTypeSelect.value = preset.waveType;
        waveWidthInput.value = preset.waveWidth;
        waveOpacityInput.value = preset.waveOpacity;
        waveHeightInput.value = preset.waveHeight;
        waveSmoothingInput.checked = preset.waveSmoothing;
        waveGradientStartInput.value = preset.waveGradientStart;
        waveGradientEndInput.value = preset.waveGradientEnd;
        waveAnimationSelect.value = preset.waveAnimation;
        updateWaveStyle();
    }
});

// 即時編輯器
codeEditor.value = drawWave.toString();
const drawWaveFunction = new Function('audioElement', 'canvas', 'ctx', codeEditor.value);

codeEditor.addEventListener('input', function() {
    try {
        drawWaveFunction(audioElement, canvas, ctx);
    } catch (error) {
        console.error('編輯器代碼錯誤:', error);
    }
});

// 切換可視化模式
visualizationModeSelect.addEventListener('change', function() {
    visualizationMode = this.value;
    // 實現不同的可視化模式
});

audioElement.addEventListener('play', drawWave);