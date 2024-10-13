import { SiteConfig } from '../config/siteConfig';
import {createOrUpdateApp, makeExtensionButton, observeElement} from '@/utils/domUtils.tsx';

export function initializeChatGPT(config: SiteConfig) {

  function insertButtonAfterElement(el: Element) {
    const button = makeExtensionButton('inline-block w-6 h-6 mr-1', (e) => {
      renderApp(true);
      e.preventDefault()
      return false;
    })
    const parentFlexCol = el?.closest('.button-container, .flex-col')!
    parentFlexCol.appendChild(button);
    parentFlexCol.classList.add('button-container');
    return button;
  }

  const renderApp = createOrUpdateApp(config, false);

  (async () => {
    renderApp(false);
    let button: Element|null = null;
    observeElement(config.buttonTargetSelector, _ => {
      const primary = document.querySelector(config.buttonTargetSelector[0]);
      const secondary = document.querySelector(config.buttonTargetSelector[1]);
      const el = (primary || secondary)!;
      if(button) {
        button.remove();
      }
      button = insertButtonAfterElement(el);
    });

  })();
}