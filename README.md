<h1 align="center">KonCaptcha - Sliding Puzzle CAPTCHA</h1>

<div align="center">

![npm version](https://img.shields.io/npm/v/@emravoan/koncaptcha?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/emravoan/koncaptcha?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/emravoan/koncaptcha?style=flat-square)
![License](https://img.shields.io/github/license/emravoan/koncaptcha?style=flat-square)

Lightweight sliding puzzle CAPTCHA to protect websites from bots.

</div>

## 🖼️ Demo

<img src="./demo.gif" alt="konCaptcha Demo" width="320" />

## 🚀 Features

- Lightweight & Performant
- Accessible and user-friendly
- Framework Agnostic
- Simple to Use
- Fully Customizable
- Zero Runtime Dependencies

## 📦 Installation

```bash
npm install @emravoan/koncaptcha
# or
pnpm add @emravoan/koncaptcha
# or
yarn add @emravoan/koncaptcha
```

## 💡 Example

```js
import konCaptcha from '@emravoan/koncaptcha';

const el = document.getElementById('captcha');
const kci = konCaptcha(el);

kci.onAttempt(result => {
  console.log(`Captcha verified: ${result.verified}`);
});
```

## 📖 Usage

#### HTML

```html
<div id="captcha"></div>
<button id="refresh">Refresh</button>
```

#### JavaScript (ES Modules)

```js
import konCaptcha from '@emravoan/koncaptcha';

const el = document.getElementById('captcha');
const kci = konCaptcha(el);

kci.onAttempt(result => {
  console.log(`Captcha verified: ${result.verified}`);
});

// Optional reset via button
// document.getElementById('refresh').addEventListener('click', () => {
//   kci.reset();
// });
```

#### UMD (Browser)

```html
<script src="https://cdn.jsdelivr.net/npm/@emravoan/koncaptcha/dist/koncaptcha.umd.js"></script>
<script>
  const el = document.getElementById('captcha');
  const kci = window.konCaptcha(el);

  kci.onAttempt(result => {
    console.log(`Captcha verified: ${result.verified}`);
  });

  // Optional reset via button
  // document.getElementById('refresh').addEventListener('click', () => {
  //   kci.reset();
  // });
</script>
```

## 📃 API

#### `konCaptcha(element: HTMLElement, options?: IKonCaptchaOption): IKonCaptchaInstance`

#### Options

```ts
interface IKonCaptchaOption {
  width?: number; // Optional. Width of the CAPTCHA container in pixels.
  height?: number; // Optional. Height of the CAPTCHA container in pixels.
  imgSrc?: string; // Optional. URL of the image to use for the CAPTCHA puzzle.
  deviation?: number; // Optional. Allowed deviation for verification (in pixels).
  wrapperClass?: string; // Optional. CSS class to apply to the main CAPTCHA wrapper element.
}
```

#### Instance

```ts
interface IKonCaptchaInstance {
  reset: () => void;
  onAttempt: (cb: (result: IKonCaptchaReturn) => void) => void;
}

interface IKonCaptchaReturn {
  verified: boolean;
}
```

## 🛠️ Development

```bash
git clone https://github.com/emravoan/koncaptcha.git
cd koncaptcha
pnpm install
pnpm build
```

## 📄 License

MIT

## ❤️ Contributing

Issues and PRs welcome!

## 📞 Contact

Please use [GitHub Issues](https://github.com/emravoan/koncaptcha/issues) for questions or suggestions.
