import { SiteConfig } from '../config/siteConfig';
import {createOrUpdateApp, makeExtensionButton, observeElement} from '@/utils/domUtils.tsx';

export function initializeAiStudio(config: SiteConfig) {
  function insertButtonAfterElement(el: Element) {
    const button = makeExtensionButton(
      'inline-flex items-center justify-center w-6 h-6',
      'w-6 h-6',
      (e) => {
        renderApp(true);
        e.preventDefault()
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