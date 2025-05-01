import postcssPrefixSelector from 'postcss-prefix-selector';
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [
    tailwindcss,
    postcssPrefixSelector({
      prefix: '.repo-prompt',
    }),
    autoprefixer(),
  ],
}