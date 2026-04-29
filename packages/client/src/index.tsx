import timelessTokens from '@castandcrew/common-ui-design-tokens/style-v2.css?inline';
import legacyTokens from '@castandcrew/common-ui-design-tokens/style.css?inline';
import { SpotlightThemeProvider } from '@castandcrew/platform-ui';
import timelessComponents from '@castandcrew/platform-ui/styles/style-v2.css?inline';
import legacyComponents from '@castandcrew/platform-ui/styles/style.css?inline';

const legacyCss = legacyTokens + '\n' + legacyComponents;
const timelessCss = timelessTokens + '\n' + timelessComponents;

export const ThemeProvider = ({ children }) => (
  <SpotlightThemeProvider
    legacyCss={legacyCss}
    timelessCss={timelessCss}
    defaultTheme='timeless'
  >
    {children}
  </SpotlightThemeProvider>
);
