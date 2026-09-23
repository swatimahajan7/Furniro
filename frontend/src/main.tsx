import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';
import '@fontsource/montserrat/latin-700.css';
import '@/styles/reset.css';
import '@/styles/tokens.css';
import '@/styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { isE2eMode } from '@/lib/env';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

if (isE2eMode()) {
  document.documentElement.dataset.e2e = 'true';
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root element in index.html');

createRoot(rootElement).render(
  <StrictMode>
    <PlaceholderPage />
  </StrictMode>,
);
