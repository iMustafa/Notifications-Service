import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';

const client = new QueryClient();
const root = createRoot(document.getElementById('root')!);
root.render(
  <QueryClientProvider client={client}>
    <App />
  </QueryClientProvider>
);

