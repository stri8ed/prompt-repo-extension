import { SiteConfig } from '../config/siteConfig';
import {createOrUpdateApp, makeExtensionButton, observeElement} from '@/utils/domUtils.tsx';

export function initializeClaude(config: SiteConfig) {
  function insertButtonAfterElement(el: Element) {
    const button = makeExtensionButton(
      `inline-flex
          ml-2
          items-center
          justify-center
          relative
          shrink-0
         
          
          border
          transition-all 
          h-8 min-w-8 
          rounded-lg 
          flex 
          items-center 
          px-[7.5px] 
          group 
        
          border-border-300 active:scale-[0.98]
          hover:text-text-200/90 
          hover:bg-bg-100`,
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