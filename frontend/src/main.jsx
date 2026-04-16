import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { Provider } from 'react-redux'
import store from '../redux/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { SocketContextProvider } from './context/SocketContext.jsx'
import axios from 'axios'

const persistor = persistStore(store);

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketContextProvider>
          <App />
          <Toaster />
        </SocketContextProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
