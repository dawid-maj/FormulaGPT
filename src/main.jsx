import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ScaleProvider } from './contexts/ScaleContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScaleProvider baseWidth={1400} maxScale={1}>
      <App />
    </ScaleProvider>
  </StrictMode>,
)
