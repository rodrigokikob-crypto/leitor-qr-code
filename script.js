const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const resultContainer = document.getElementById('resultContainer');
const resultText = document.getElementById('resultText');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const resetButton = document.getElementById('resetButton');
const copyButton = document.getElementById('copyButton');
const openLinkButton = document.getElementById('openLinkButton');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Drag and Drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  uploadArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  uploadArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  uploadArea.classList.add('dragover');
}

function unhighlight() {
  uploadArea.classList.remove('dragover');
}

uploadArea.addEventListener('drop', handleDrop, false);
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFiles);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles({ target: { files } });
}

function handleFiles(e) {
  const file = e.target.files[0];
  if (file) {
    processImage(file);
  }
}

function processImage(file) {
  resetUI();
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        if (typeof jsQR === 'undefined') {
          throw new Error('Biblioteca jsQR nao carregada. Verifique sua conexao com a internet.');
        }
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });
        if (code) {
          showResult(code.data);
        } else {
          showError('Nao foi possivel encontrar um QR Code nesta imagem.');
        }
      } catch (err) {
        console.error(err);
        showError(`Erro ao processar QR Code: ${err.message}`);
      }
    };
    img.onerror = () => {
      showError('O arquivo selecionado nao eh uma imagem valida.');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function showResult(text) {
  uploadArea.hidden = true;
  resultContainer.hidden = false;
  resultText.textContent = text;
  errorContainer.hidden = true;

  if (isValidURL(text)) {
    openLinkButton.hidden = false;
    openLinkButton.onclick = () => {
      window.open(text, '_blank');
    };

    // AUTO-OPEN LOGIC
    try {
      const newWindow = window.open(text, '_blank');
      if (newWindow && !newWindow.closed) {
        // Se abriu com sucesso, reseta a interface apos 1 segundo
        setTimeout(resetUI, 1000);
      } else {
        // Se o navegador bloquear, mostramos uma mensagem sutil ou apenas deixamos o botao disponvel
        console.log('Auto-open bloqueado pelo navegador.');
      }
    } catch (e) {
      console.error('Erro ao tentar abrir link automaticamente:', e);
    }
  } else {
    openLinkButton.hidden = true;
  }
}

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function showError(message) {
  errorContainer.hidden = false;
  errorMessage.textContent = message;
  uploadArea.hidden = false;
  resultContainer.hidden = true;
}

function resetUI() {
  uploadArea.hidden = false;
  resultContainer.hidden = true;
  errorContainer.hidden = true;
  fileInput.value = '';
  openLinkButton.hidden = true;
}

resetButton.addEventListener('click', resetUI);

copyButton.addEventListener('click', () => {
  const textToCopy = resultText.textContent;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy).then(showCopySuccess).catch(() => fallbackCopyTextToClipboard(textToCopy));
  } else {
    fallbackCopyTextToClipboard(textToCopy);
  }
});

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) showCopySuccess();
  } catch (err) {
    console.error('Fallback Erro ao copiar:', err);
  }
  document.body.removeChild(textArea);
}

function showCopySuccess() {
  const originalIcon = copyButton.innerHTML;
  copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  setTimeout(() => {
    copyButton.innerHTML = originalIcon;
  }, 2000);
}
