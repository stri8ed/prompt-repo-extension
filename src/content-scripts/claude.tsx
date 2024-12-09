import { SiteConfig } from '../config/siteConfig';
import {createOrUpdateApp, makeExtensionButton, observeElement} from '@/utils/domUtils.tsx';

export function initializeClaude(config: SiteConfig) {
  function insertButtonAfterElement(el: Element) {
    const button = makeExtensionButton(
      'inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-bg-500/40 ',
      'w-4 h-4',
      (e) => {
        renderApp(true);
        e.preventDefault()
    })
    el.parentElement!.parentElement!.appendChild(button);
    return button;
  }

  const renderApp = createOrUpdateApp(config, false);

  (async () => {
    renderApp(false);
    let button: Element|null = null;
    observeElement(config.buttonTargetSelector, el => {
      if(button) {
        button.remove();
      }
      button = insertButtonAfterElement(el);
    });

  })();
}