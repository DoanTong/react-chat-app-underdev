import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { Socket } from 'socket.io-client'
import { SocketProvider } from './context/SocketContext'

createRoot(document.getElementById('root')).render(
  //<StrictMode>
<>
<SocketProvider>
  <App />
  <Toaster closeButton/>
</SocketProvider>
  
</>
 // </StrictMode>,
);
