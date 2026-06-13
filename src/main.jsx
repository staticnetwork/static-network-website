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
