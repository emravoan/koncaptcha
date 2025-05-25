import { test, expect } from 'vitest';

import konCaptcha from './index';

test('Initialize Captcha', () => {
  document.body.innerHTML = '<div id="captcha"></div>';
  const el = document.getElementById('captcha')!;
  konCaptcha(el);
  expect(el.firstElementChild?.id).toBe('koncaptcha');
});
