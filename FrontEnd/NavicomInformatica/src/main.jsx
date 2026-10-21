import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider.jsx'
import { CartProvider } from "./context/CartContext.jsx";

import { NotificationProvider } from './context/NotificationContext.jsx'
import NotificationContainer from './Componentes/NotificationContainer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <App />
            <NotificationContainer />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
)
