const matrixCanvas = document.getElementById('matrixCanvas');
const matrixCtx = matrixCanvas.getContext('2d');

let width = (matrixCanvas.width = window.innerWidth);
let height = (matrixCanvas.height = window.innerHeight);
const cols = Math.floor(width / 20) + 1;
const ypos = Array(cols).fill(0);

window.addEventListener('resize', () => {
  width = matrixCanvas.width = window.innerWidth;
  height = matrixCanvas.height = window.innerHeight;
  // Recalculate columns on resize (might be needed for perfect responsiveness, but for simple effect, just clearing is often enough or re-init array. For now lets just keep running, it might look a bit weird on resize but ok.
});

function matrix() {
  // Draw a semi-transparent black rectangle on top of previous frame to create fade effect
  matrixCtx.fillStyle = '#0001';
  matrixCtx.fillRect(0, 0, width, height);
  matrixCtx.fillStyle = '#0f0';
  matrixCtx.font = '15pt monospace';
  ypos.forEach((y, ind) => {
    const text = String.fromCharCode(Math.random() * 128);
    const x = ind * 20;
    matrixCtx.fillText(text, x, y);
    if (y > 100 + Math.random() * 10000) {
      ypos[ind] = 0;
    } else {
      ypos[ind] = y + 20;
    }
  });
}

setInterval(matrix, 50);
