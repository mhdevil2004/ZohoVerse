document.addEventListener('DOMContentLoaded', function () {
  // Canvas Setup
  const canvas = document.getElementById('whiteboard');
  const ctx = canvas.getContext('2d');

  // State Management
  let isDrawing = false;
  let currentTool = 'pen';
  let currentColor = '#000000';
  let currentWidth = 3;
  let currentOpacity = 1;
  let startX, startY;
  let pages = [];
  let currentPage = 0;
  let drawingHistory = [[]];
  let historyIndex = [0];
  const MAX_HISTORY_STATES = 50;

  // DOM Elements
  const penBtn = document.getElementById('pen-btn');
  const shapesBtn = document.getElementById('shapes-btn');
  const eraserBtn = document.getElementById('eraser-btn');
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  const clearBtn = document.getElementById('clear-btn');
  const micBtn = document.getElementById('mic-btn');
  const cameraBtn = document.getElementById('camera-btn');
  const screenShareBtn = document.getElementById('screen-share-btn');
  const chatBtn = document.getElementById('chat-btn');
  const closeChatBtn = document.getElementById('close-chat');
  const settingsBtn = document.getElementById('settings-btn');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const newPageBtn = document.getElementById('new-page');
  const pageNumber = document.getElementById('page-number');
  const shapesPanel = document.getElementById('shapes-panel');
  const settingsPanel = document.getElementById('settings-panel');
  const chatPanel = document.getElementById('chat-panel');
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const lineWidth = document.getElementById('line-width');
  const widthValue = document.getElementById('width-value');
  const opacity = document.getElementById('opacity');
  const opacityValue = document.getElementById('opacity-value');
  const userVideo = document.getElementById('user-video');
  const toggleVideo = document.getElementById('toggle-video');
  const toggleMicBtn = document.getElementById('toggle-mic'); // renamed to avoid conflict
  const videoPanel = document.getElementById('video-panel');
  const toolStatus = document.getElementById('tool-status');
  const colorStatus = document.getElementById('color-status');
  const sizeStatus = document.getElementById('size-status');

  // Initialization
  initCanvas();
  initPages();
  updateStatusBar();
  setActiveTool('pen');

  function initCanvas() {
    resizeCanvas();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentWidth;
    ctx.globalAlpha = currentOpacity;
    saveDrawingState();
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - document.querySelector('.top-bar').offsetHeight - document.querySelector('.status-bar').offsetHeight;
    restoreCanvas();
  }

  window.addEventListener('resize', resizeCanvas);

  function initPages() {
    pages = [canvas.toDataURL()];
    currentPage = 0;
    drawingHistory = [[pages[0]]];
    historyIndex = [0];
    updatePageNumber();
  }

  function newPage() {
    pages[currentPage] = canvas.toDataURL();
    pages.push(canvas.toDataURL());
    currentPage = pages.length - 1;
    drawingHistory.push([pages[currentPage]]);
    historyIndex.push(0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveDrawingState();
    updatePageNumber();
  }

  function goToPage(index) {
    if (index < 0 || index >= pages.length) return;
    pages[currentPage] = canvas.toDataURL();
    currentPage = index;
    restoreCanvas();
    updatePageNumber();
  }

  function updatePageNumber() {
    pageNumber.textContent = `Page ${currentPage + 1}/${pages.length}`;
    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = currentPage === pages.length - 1;
  }

  function getClientX(e) {
    return e.clientX || e.touches[0]?.clientX;
  }

  function getClientY(e) {
    return (e.clientY || e.touches[0]?.clientY) - document.querySelector('.top-bar').offsetHeight;
  }

  function startDrawing(e) {
    isDrawing = true;
    startX = getClientX(e);
    startY = getClientY(e);
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }

  function draw(e) {
    if (!isDrawing) return;
    const x = getClientX(e);
    const y = getClientY(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    saveDrawingState();
  }

  function drawShape(sx, sy, ex, ey) {
    ctx.beginPath();
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    ctx.lineWidth = currentWidth;
    ctx.globalAlpha = currentOpacity;
    const shape = document.querySelector('.shape-btn.active')?.dataset.shape;
    switch (shape) {
      case 'line': ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); break;
      case 'rectangle': ctx.rect(sx, sy, ex - sx, ey - sy); ctx.stroke(); break;
      case 'circle':
        const r = Math.hypot(ex - sx, ey - sy);
        ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.stroke(); break;
      case 'triangle':
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.lineTo(sx * 2 - ex, ey);
        ctx.closePath(); ctx.stroke(); break;
      case 'arrow': drawArrow(sx, sy, ex, ey); break;
    }
  }

  function drawArrow(sx, sy, ex, ey) {
    const headLength = 15;
    const angle = Math.atan2(ey - sy, ex - sx);
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex - headLength * Math.cos(angle - Math.PI / 6), ey - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - headLength * Math.cos(angle + Math.PI / 6), ey - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }

  function saveDrawingState() {
    if (historyIndex[currentPage] < drawingHistory[currentPage].length - 1) {
      drawingHistory[currentPage] = drawingHistory[currentPage].slice(0, historyIndex[currentPage] + 1);
    }
    const state = canvas.toDataURL();
    drawingHistory[currentPage].push(state);
    historyIndex[currentPage] = drawingHistory[currentPage].length - 1;
    if (drawingHistory[currentPage].length > MAX_HISTORY_STATES) {
      drawingHistory[currentPage].shift();
      historyIndex[currentPage]--;
    }
    updateUndoRedoButtons();
  }

  function undo() {
    if (historyIndex[currentPage] <= 0) return;
    historyIndex[currentPage]--;
    restoreCanvas();
  }

  function redo() {
    if (historyIndex[currentPage] >= drawingHistory[currentPage].length - 1) return;
    historyIndex[currentPage]++;
    restoreCanvas();
  }

  function restoreCanvas() {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = drawingHistory[currentPage][historyIndex[currentPage]];
    updateUndoRedoButtons();
  }

  function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex[currentPage] <= 0;
    redoBtn.disabled = historyIndex[currentPage] >= drawingHistory[currentPage].length - 1;
  }

  function setActiveTool(tool) {
    currentTool = tool;
    penBtn.classList.remove('active');
    shapesBtn.classList.remove('active');
    eraserBtn.classList.remove('active');
    if (tool === 'pen') penBtn.classList.add('active');
    if (tool === 'shape') shapesBtn.classList.add('active');
    if (tool === 'eraser') eraserBtn.classList.add('active');
    canvas.style.cursor = tool === 'eraser'
      ? "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"black\" d=\"M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0Z\"/></svg>') 8 8, auto"
      : "crosshair";
    if (tool !== 'shape') shapesPanel.style.display = 'none';
    updateStatusBar();
  }

  function setActiveShape(shape) {
    document.querySelectorAll('.shape-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.shape-btn[data-shape="${shape}"]`)?.classList.add('active');
    currentTool = 'shape';
    updateStatusBar();
  }

  function updateSettings() {
    currentWidth = lineWidth.value;
    widthValue.textContent = `${currentWidth}px`;
    currentOpacity = opacity.value / 100;
    opacityValue.textContent = `${opacity.value}%`;
    ctx.lineWidth = currentWidth;
    ctx.globalAlpha = currentOpacity;
    updateStatusBar();
  }

  function setActiveColor(color) {
    currentColor = color;
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    updateStatusBar();
  }

  function updateStatusBar() {
    const shape = document.querySelector('.shape-btn.active')?.dataset.shape || '';
    const toolText = currentTool === 'shape' ? `Shape (${shape})` : currentTool.charAt(0).toUpperCase() + currentTool.slice(1);
    toolStatus.innerHTML = `<i class="fas fa-${currentTool === 'pen' ? 'pen' : currentTool === 'shape' ? 'shapes' : 'eraser'}"></i> ${toolText}`;
    colorStatus.innerHTML = `<span class="color-preview" style="background: ${currentColor};"></span> ${currentColor}`;
    sizeStatus.textContent = `${currentWidth}px`;
  }

  async function toggleCamera() {
    try {
      if (userVideo.srcObject) {
        userVideo.srcObject.getTracks().forEach(track => track.stop());
        userVideo.srcObject = null;
        cameraBtn.classList.remove('active');
        videoPanel.style.display = 'none';
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        userVideo.srcObject = stream;
        cameraBtn.classList.add('active');
        videoPanel.style.display = 'block';
      }
    } catch (err) {
      alert("Could not access camera");
    }
  }

  async function handleMicToggle() {
    try {
      if (toggleMicBtn.classList.contains('active')) {
        toggleMicBtn.classList.remove('active');
        // Mute logic
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        toggleMicBtn.classList.add('active');
        // Unmute logic
      }
    } catch (err) {
      alert("Could not access mic");
    }
  }

  async function toggleScreenShare() {
    try {
      if (screenShareBtn.classList.contains('active')) {
        screenShareBtn.classList.remove('active');
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenShareBtn.classList.add('active');
      }
    } catch (err) {
      alert("Screen share error");
    }
  }

  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    addMessage(message, true);
    messageInput.value = '';
    setTimeout(() => addMessage(`Reply to: ${message}`, false), 1000);
  }

  function addMessage(msg, isUser = true) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user' : 'other'}`;
    msgDiv.innerHTML = `<p>${msg}</p>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Event Listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); startDrawing(e); });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); draw(e); });
  canvas.addEventListener('touchend', stopDrawing);

  penBtn.addEventListener('click', () => setActiveTool('pen'));
  shapesBtn.addEventListener('click', () => { setActiveTool('shape'); shapesPanel.style.display = 'flex'; });
  eraserBtn.addEventListener('click', () => setActiveTool('eraser'));

  document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveShape(btn.dataset.shape));
  });

  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear canvas?')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveDrawingState();
    }
  });

  settingsBtn.addEventListener('click', () => {
    settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
  });

  lineWidth.addEventListener('input', updateSettings);
  opacity.addEventListener('input', updateSettings);

  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      setActiveColor(swatch.dataset.color);
    });
  });

  cameraBtn.addEventListener('click', toggleCamera);
  micBtn.addEventListener('click', handleMicToggle);
  toggleMicBtn.addEventListener('click', handleMicToggle);
  toggleVideo.addEventListener('click', toggleCamera);
  screenShareBtn.addEventListener('click', toggleScreenShare);

  chatBtn.addEventListener('click', () => {
    chatPanel.style.display = chatPanel.style.display === 'flex' ? 'none' : 'flex';
  });
  closeChatBtn.addEventListener('click', () => chatPanel.style.display = 'none');
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

  prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
  nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
  newPageBtn.addEventListener('click', newPage);

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#shapes-btn') && !e.target.closest('#shapes-panel')) {
      shapesPanel.style.display = 'none';
    }
    if (!e.target.closest('#settings-btn') && !e.target.closest('#settings-panel')) {
      settingsPanel.style.display = 'none';
    }
  });
});
