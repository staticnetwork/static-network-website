import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { RouterProvider } from './components/Router.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SageProvider } from './context/SageContext.jsx'
import './styles.css'
import './upgrade.css'
import './entity.css'
import './network-os.css'
import './entity-generator.css'
import './sage.css'
import './sage-owner.css'
import './beta-gate.css'
import './styles/portal.css'
import './styles/district.css'
import './static-city.css'
import './entrance-reframe.css'
import './social-reframe.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <AuthProvider>
        <SageProvider>
          <App />
        </SageProvider>
      </AuthProvider>
    </RouterProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installability should never block the app shell.
    })
  })
}
