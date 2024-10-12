import siteConfigs from '../config/siteConfig';
import { initializeChatGPT } from './chatgpt';
import 'tailwindcss/tailwind.css';
import {initializeClaude} from "@/content-scripts/claude.tsx";

const currentUrl = window.location.href;
const matchingSite = siteConfigs.find(site => site.urlPattern.test(currentUrl));

if (matchingSite) {
  switch (matchingSite.name) {
    case 'ChatGPT':
      initializeChatGPT(matchingSite);
      break;
    case 'Claude':
      initializeClaude(matchingSite);
      break
    default:
      console.log(`No initialization function for ${matchingSite.name}`);
  }
}