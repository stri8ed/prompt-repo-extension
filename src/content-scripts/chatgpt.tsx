import { SiteConfig } from '../config/siteConfig';
import {createOrUpdateApp, makeExtensionButton, observeElement} from '@/utils/domUtils.tsx';

export function initializeChatGPT(config: SiteConfig) {

  function insertButtonAfterElement(el: Element) {
    const button = makeExtensionButton(
      'ml-2 flex items-center justify-center h-9 rounded-full border border-token-border-default text-token-text-secondary w-9 can-hover:hover:bg-token-main-surface-secondary',
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
    observeElement(config.buttonTargetSelector, el => {
      if(button) {
        button.remove();
      }
      button = insertButtonAfterElement(el);
    });

  })();
}