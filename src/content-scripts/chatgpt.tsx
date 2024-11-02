import { SiteConfig } from '../config/siteConfig';
import {createOrUpdateApp, makeExtensionButton, observeElement} from '@/utils/domUtils.tsx';

export function initializeChatGPT(config: SiteConfig) {

  function insertButtonAfterElement(el: Element) {
    const button = makeExtensionButton(
      'inline-flex items-center justify-center h-8 w-8 rounded-lg rounded-bl-xl hover:bg-black/10 text-token-text-primary dark:text-white focus-visible:outline-black dark:focus-visible:outline-white',
      'w-5 h-5',
      (e) => {
        renderApp(true);
        e.preventDefault()
    })
    let parent: Element
    if(el.matches(config.buttonTargetSelector[0])) {
      parent = el.parentElement!;
      parent.classList.add('flex', 'flex-row')
    } else {
      parent = el.closest('.flex-col')!;
    }
    parent.appendChild(button);
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