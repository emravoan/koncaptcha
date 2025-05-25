import './index.css';
import { useThrottleFn } from './utils';

interface IKonCaptchaOption {
  width?: number;
  height?: number;
  imgSrc?: string;
  deviation?: number;
  wrapperClass?: string;
}

interface IKonCaptchaReturn {
  verified: boolean;
}

interface IKonCaptchaInstance {
  reset: () => void;
  onAttempt: (cb: (result: IKonCaptchaReturn) => void) => void;
}

function konCaptcha(container: HTMLElement, option?: IKonCaptchaOption): IKonCaptchaInstance {
  // State variables
  const width: number = option?.width || 300;
  const height: number = option?.height || 200;
  const pieceSize: number = 40;
  const deviation: number = option?.deviation || 5; // Allowed deviation for successful verification

  let cutX: number = 0;
  let cutY: number = 0;
  let currentSliderValue: number = 5;
  let isVerified: boolean = false;
  let isDragging: boolean = false;

  // DOM elements
  let canvas: HTMLCanvasElement;
  let canvasWrapper: HTMLDivElement;
  let ctx: CanvasRenderingContext2D;
  let image: HTMLImageElement = new Image();
  let imageSrc: string;
  let elSliderReset: HTMLDivElement;
  let elSliderTrack: HTMLDivElement;
  let elSliderEraser: HTMLDivElement;
  let elMessage: HTMLDivElement;

  // Slider mechanics
  let startX = 0;
  let startPos = 0;
  let maxSlide = 0;

  let onAttemptCallback: ((result: IKonCaptchaReturn) => void) | null = null;

  const state = {
    reset: false,
    verify: false,
  };

  const watch = new Proxy(state, {
    set(target, prop: keyof typeof state, value) {
      target[prop] = value;

      if (prop === 'reset') {
        state.reset = false;
        state.verify = false;
        reset();
      }

      if (prop === 'verify') {
        isVerified = value;
        elMessage.className += ` ${value ? 'bg-blue-400' : 'bg-rose-400'}`;
        elMessage.textContent = value ? 'Verification success' : 'Please try again';
        if (!value) setTimeout(reset, 1000);
        if (onAttemptCallback) {
          onAttemptCallback({ verified: value });
        }
      }

      return true;
    },
  });

  const initialize = (): void => {
    // Main wrapper
    const elWrapper = document.createElement('div');
    elWrapper.id = 'koncaptcha';
    elWrapper.className = `p-4 flex flex-col gap-1.5 border border-gray-100 shadow rounded-md overflow-hidden select-none ${option?.wrapperClass || ''}`;
    elWrapper.style.width = `${width + 32}px`;
    container.appendChild(elWrapper);

    // Canvas container
    canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'relative bg-gray-200 rounded-xs overflow-hidden';
    canvasWrapper.style.width = `${width}px`;
    canvasWrapper.style.height = `${height}px`;
    elWrapper.appendChild(canvasWrapper);

    // Canvas element
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.className = 'relative z-0 rounded-xs overflow-hidden';
    ctx = canvas.getContext('2d')!;
    // image.crossOrigin = 'anonymous';
    canvasWrapper.appendChild(canvas);

    // Message overlay
    elMessage = document.createElement('div');
    elMessage.className = 'animate-up w-full h-8 flex justify-center items-center absolute z-10 bottom-0 text-sm text-white empty:hidden';
    canvasWrapper.appendChild(elMessage);

    // Slider reset
    elSliderReset = document.createElement('div');
    elSliderReset.className = 'h-7 w-7 flex justify-center items-center absolute z-10 top-1.5 right-1.5 bg-rose-400 text-white rounded-full shadow-xl cursor-pointer';
    elSliderReset.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24">
        <path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z" />
      </svg>
    `;
    elSliderReset.addEventListener('click', () => (watch.reset = true));
    canvasWrapper.appendChild(elSliderReset);

    // Slider container
    const elSliderWrapper = document.createElement('div');
    elSliderWrapper.className = 'h-9 p-0.5 bg-gray-200 rounded-xs';
    elSliderWrapper.style.width = `${width}px`;
    elWrapper.appendChild(elSliderWrapper);

    // Slider thumb
    const elSliderThumb = document.createElement('div');
    elSliderThumb.className = 'h-8 flex justify-center items-center relative overflow-hidden';
    elSliderWrapper.appendChild(elSliderThumb);

    // Slider text
    const elSliderText = document.createElement('div');
    elSliderText.className = 'absolute z-0 text-gray-500 text-sm';
    elSliderText.textContent = 'Slide to complete the puzzle';
    elSliderThumb.appendChild(elSliderText);

    // slider text eraser
    elSliderEraser = document.createElement('div');
    elSliderEraser.className = 'h-full absolute left-0 z-10 bg-gray-200 text-sm';
    elSliderThumb.appendChild(elSliderEraser);

    // Slider track
    elSliderTrack = document.createElement('div');
    elSliderTrack.className = 'h-8 w-9 flex justify-center items-center absolute z-50 left-0 bg-white rounded-xs shadow-lg hover:cursor-pointer';
    elSliderTrack.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 18l6-6l-6-6m8 12l6-6l-6-6" />
      </svg>
    `;
    elSliderTrack.addEventListener('mousedown', startDrag);
    elSliderThumb.appendChild(elSliderTrack);

    // Calculate max slide
    requestAnimationFrame(() => {
      maxSlide = elSliderThumb.offsetWidth - elSliderTrack.offsetWidth;
    });

    stylesheet();
    watch.reset = true;
  };

  const stylesheet = (): void => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes animateUp {
        from { opacity: 0; transform: translateY(100%); }
        to { opacity: 1; transform: translateY(0); }
      }

      .animate-up {
        animation: animateUp 0.2s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
  };

  const drawPiece = (x: number, y: number, isMovingPiece: boolean): void => {
    const r = pieceSize;
    const o = 7;
    const s = Math.PI;
    const cx = pieceSize + 11.5;
    const cy = pieceSize + 12;

    ctx.save();
    ctx.beginPath();

    // Define the path for the puzzle piece shape
    ctx.moveTo(x, y);
    ctx.arc(x + r / 2, y - o + 2, o, 0.72 * s, 2.26 * s); // Top protrusion
    ctx.lineTo(x + r, y);
    ctx.arc(x + r + o - 2, y + r / 2, o, 1.21 * s, 2.78 * s); // Right protrusion
    ctx.lineTo(x + r, y + r);
    ctx.lineTo(x, y + r);
    ctx.arc(x + o - 2, y + r / 2, o + 0.4, 2.76 * s, 1.24 * s, true); // Left indentation
    ctx.lineTo(x, y);

    ctx.closePath();
    ctx.clip();

    if (isMovingPiece) {
      // Draw the image onto the current clipped context
      // The image is offset by -cutX to show the correct part of the image
      ctx.drawImage(image, cutX, cutY - 12, cx, cy, x, y - 12, cx, cy);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // White border
      ctx.stroke();
    } else {
      // Set shadow properties
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // This branch is for the puzzle hole
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawPuzzle = async (): Promise<void> => {
    return new Promise(resolve => {
      if (!ctx) {
        resolve();
        return;
      }

      image.src = imageSrc;
      image.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        drawPiece(cutX, cutY, false);
        drawPiece(currentSliderValue, cutY, true);
        resolve();
      };
      image.onerror = () => {
        watch.reset = true;
        resolve();
      };
    });
  };

  const startDrag = (ev: any) => {
    if (isVerified) return;

    ev.preventDefault();
    isDragging = true;

    // Get starting position
    startX = ev.type === 'mousedown' ? ev.clientX : ev.touches[0].clientX;
    startPos = currentSliderValue;

    // Add event listeners for drag and end
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
  };

  const onDrag = (ev: any) => {
    if (!isDragging) return;

    ev.preventDefault();
    let newPos;

    // Calculate new position
    const x = ev.type === 'mousemove' ? ev.clientX : ev.touches[0].clientX;
    newPos = startPos + (x - startX);

    // Constrain to slider boundaries
    newPos = Math.max(0, Math.min(newPos, maxSlide));

    // Update slider position
    elSliderTrack.style.left = `${newPos}px`;
    elSliderEraser.style.width = `${newPos}px`;
    currentSliderValue = newPos;

    drawPuzzle();
  };

  const endDrag = () => {
    if (!isDragging) return;

    disableTracker();
    isDragging = false;

    // Check if the puzzle piece is correctly positioned
    const diff = Math.abs(currentSliderValue - cutX);
    if (diff < deviation) {
      watch.verify = true;
      currentSliderValue = cutX;
      drawPuzzle();
    } else {
      watch.verify = false;
    }

    // Remove event listeners
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
  };

  const enableTracker = () => {
    elSliderTrack.style.pointerEvents = '';
  };

  const disableTracker = () => {
    elSliderTrack.style.pointerEvents = 'none';
  };

  const handleReset = async (): Promise<void> => {
    isVerified = false;
    currentSliderValue = 5;

    const sources = [
      // `https://placedog.net/${width}/${height}?r&t=${Date.now()}`,
      // `https://placeholder.pagebee.io/api/random/${width}/${height}?t=${Date.now()}`,
      `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/${width}/${height}`,
    ];

    // Random new image
    imageSrc = option?.imgSrc || sources[Math.floor(Math.random() * sources.length)];

    // Randomize new cut positions for a fresh puzzle
    cutX = Math.floor(Math.random() * (width - pieceSize * 2)) + pieceSize;
    cutX = Math.max(cutX, width / 2.5);
    cutX = Math.min(cutX, width - pieceSize * 1.5);

    cutY = Math.floor(Math.random() * (height - pieceSize));
    cutY = Math.max(cutY, pieceSize);
    cutY = Math.min(cutY, height - pieceSize * 1.25);

    await drawPuzzle();
    enableTracker();

    elMessage.textContent = '';
    elMessage.classList.remove('bg-blue-400', 'bg-rose-400');
    elSliderTrack.style.left = '0px';
    elSliderEraser.style.width = '0px';
  };

  const reset = useThrottleFn(handleReset, 500);

  initialize();

  return {
    reset: () => {
      watch.reset = true;
    },
    onAttempt: cb => {
      onAttemptCallback = cb;
    },
  };
}

export default konCaptcha;
