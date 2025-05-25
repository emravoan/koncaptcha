import konCaptcha from './index';

const kci = konCaptcha(document.getElementById('captcha')!);

kci.onAttempt(result => {
  console.log(`Captcha verified: ${result.verified}`);
});
