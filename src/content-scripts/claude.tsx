import { SiteConfig } from '../config/siteConfig';
import {createOrUpdateApp, makeExtensionButton, observeElement} from '@/utils/domUtils.tsx';

export function initializeClaude(config: SiteConfig) {
  function insertButtonAfterElement(el: Element) {
    const button = makeExtensionButton('inline-block w-4 h-4 flex', (e) => {
      renderApp(true);
      e.preventDefault()
      return false;
    })

    el.parentElement!.appendChild(button);
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