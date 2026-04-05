import { Toaster } from '@/components/ui/sonner';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.tsx';
import './index.css';
import { persistor, store } from './store/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
