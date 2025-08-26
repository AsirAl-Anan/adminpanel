import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
  import { ToastContainer, Slide } from 'react-toastify';
createRoot(document.getElementById('root')).render(
  <StrictMode>
 
    <UserProvider>
   <ToastContainer
position="top-center"
autoClose={3000}
hideProgressBar
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="white"
transition={Slide}
/>
    <App />

 
    </UserProvider>
   
  </StrictMode>,
)
