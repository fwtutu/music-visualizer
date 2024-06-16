const audioElement = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const fileInput = document.getElementById('fileInput'); 
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toggleCustomizationBtn = document.getElementById('toggleCustomization');
const customizationOptions = document.querySelector('.customization-options');

// 自訂波型樣式選項
const waveColorSetting = document.getElementById('waveColorSetting');
const waveColorValue = document.getElementById('waveColorValue');
const waveColorTypeSelect = document.getElementById('waveColorType');
const waveColorOption = document.getElementById('waveColorOption');
const waveGradientOption = document.getElementById('waveGradientOption');
const waveTypeSelect = document.getElementById('waveType');
const waveColorInput = document.getElementById('waveColor');
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
const visualizationModeSelect = document.getElementById('visualizationMode');

// 初始化波型樣式
let waveSettings = {
    waveType: waveTypeSelect.value,
    waveColor: waveColorInput.value,
    waveWidth: waveWidthInput.value,
    waveOpacity: waveOpacityInput.value,
    waveHeight: waveHeightInput.value,
    waveSmoothing: waveSmoothingInput.checked,
    waveGradientStart: waveGradientStartInput.value,
    waveGradientEnd: waveGradientEndInput.value,
    waveAnimation: waveAnimationSelect.value
};

let presets = {};
let visualizationMode = visualizationModeSelect.value;

// 處理檔案上傳
fileInput.addEventListener('change', function () {
    const file = this.files[0];
    const url = URL.createObjectURL(file);
    audioElement.src = url;
});

// 播放/暫停音樂
playBtn.addEventListener('click', function () {
    if (audioElement.paused) {
        audioElement.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioElement.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
});

// 更新進度條
audioElement.addEventListener('timeupdate', function () {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    progressBar.value = progress;
});

// 拖曳進度條
progressBar.addEventListener('input', function () {
    const seekTime = (audioElement.duration * this.value) / 100;
    audioElement.currentTime = seekTime;
});

// 更新波型樣式
function updateWaveStyle() {
    waveSettings = {
        waveType: waveTypeSelect.value,
        waveColor: waveColorInput.value,
        waveWidth: waveWidthInput.value,
        waveOpacity: waveOpacityInput.value,
        waveHeight: waveHeightInput.value,
        waveSmoothing: waveSmoothingInput.checked,
        waveGradientStart: waveGradientStartInput.value,
        waveGradientEnd: waveGradientEndInput.value,
        waveAnimation: waveAnimationSelect.value
    };
}

// 绘制波型
function drawWaveform(dataArray) {
    const bufferLength = dataArray.length;
    const barWidth = (canvas.width / bufferLength) * waveSettings.waveWidth;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (waveSettings.waveHeight / canvas.height) * canvas.height;
        let gradient;

        if (waveColorTypeSelect.value === 'gradient') {
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, waveSettings.waveGradientStart);
            gradient.addColorStop(1, waveSettings.waveGradientEnd);
        }

        ctx.fillStyle = gradient || waveSettings.waveColor;
        ctx.globalAlpha = waveSettings.waveOpacity;

        switch (waveSettings.waveType) {
            case 'bar':
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                break;
            case 'line':
                ctx.beginPath();
                ctx.moveTo(x, canvas.height);
                ctx.lineTo(x, canvas.height - barHeight);
                ctx.strokeStyle = gradient || waveSettings.waveColor;
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

function drawSpectrum(dataArray, analyser) {
    const barWidth = (canvas.width / analyser.fftSize) * 2;
    let x = 0;
    for (let i = 0; i < analyser.fftSize / 2; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
}

function drawVisualization() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

        if (visualizationMode === 'waveform') {
            drawWaveform(dataArray);
        } else if (visualizationMode === 'spectrum') {
            drawSpectrum(dataArray, analyser);
        }
    }

    animate();
}

// 监听自定义样式变化
[
    waveTypeSelect, waveColorInput, waveWidthInput, waveOpacityInput, 
    waveHeightInput, waveSmoothingInput, waveGradientStartInput, 
    waveGradientEndInput, waveAnimationSelect
].forEach(element => element.addEventListener('input', updateWaveStyle));

// 监听颜色类型变化
waveColorTypeSelect.addEventListener('change', function() {
    const display = waveColorTypeSelect.value === 'gradient' ? 'none' : 'block';
    waveColorOption.style.display = display;
    waveGradientOption.style.display = display === 'none' ? 'block' : 'none';
});

// 保存预设样式
savePresetBtn.addEventListener('click', function () {
    const presetName = prompt('請輸入預設樣式名稱:');
    if (presetName) {
        presets[presetName] = { ...waveSettings };
        presetSelect.innerHTML = '';
        Object.keys(presets).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            presetSelect.add(option);
        });
    }
});

// 载入预设样式
loadPresetBtn.addEventListener('click', function () {
    const presetName = presetSelect.value;
    if (presetName) {
        const preset = presets[presetName];
        Object.keys(preset).forEach(key => {
            if (key in waveSettings) {
                waveSettings[key] = preset[key];
            }
        });
        waveTypeSelect.value = preset.waveType;
        waveColorInput.value = preset.waveColor;
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

// 切换自定义选项显示/隐藏
toggleCustomizationBtn.addEventListener('click', function () {
    customizationOptions.style.display = customizationOptions.style.display === 'none' ? 'block' : 'none';
    toggleCustomizationBtn.innerHTML = customizationOptions.style.display === 'none' ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-up"></i>';
});

visualizationModeSelect.addEventListener('change', function() {
    visualizationMode = this.value;
    drawVisualization();
});

// 初始化绘制
audioElement.addEventListener('play', drawVisualization);
