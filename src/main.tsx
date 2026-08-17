import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* خط الواجهة العربي — مستضاف ذاتياً (لا CDN)؛ الأوزان الأربعة المستخدمة في المقياس الطباعي */
import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/500.css'
import '@fontsource/ibm-plex-sans-arabic/600.css'
import '@fontsource/ibm-plex-sans-arabic/700.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/ui.css'
import './styles/nav.css'
import './styles/data.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
