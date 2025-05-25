interface IOption {
  imgSrc?: string;
  darkMode?: boolean;
}

interface IReturn {
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

export const generatePattern = (w: number, h: number, option?: IOption): Promise<IReturn> => {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d')!;

    if (option?.imgSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = option?.imgSrc;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        resolve({
          image: img,
          canvas,
          context: ctx,
        });
      };
    } else {
      const isDark = option?.darkMode;

      const gradient = ctx.createLinearGradient(0, 0, w, h);
      if (isDark) {
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#1a1a2e');
      } else {
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#9b59b6');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Add some random shapes for texture
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = Math.random() * 20 + 5;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * (isDark ? 0.1 : 0.2)})`;
        ctx.fill();
      }

      // Add some geometric patterns
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * 30 + 10;

        ctx.beginPath();
        if (Math.random() > 0.5) {
          // Draw a square
          ctx.rect(x, y, size, size);
        } else {
          // Draw a triangle
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x + size / 2, y - size);
          ctx.closePath();
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
        ctx.fill();
      }

      resolve({
        image: new Image(),
        canvas,
        context: ctx,
      });
    }
  });
};

export const useThrottleFn = <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
};
