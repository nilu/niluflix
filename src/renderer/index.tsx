import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './input.css';

console.log('index.tsx loaded!');
console.log('Document ready state:', document.readyState);

// Get the root element
const container = document.getElementById('root');
console.log('Root container:', container);

if (!container) {
  console.error('Root element not found!');
  throw new Error('Root element not found');
}

console.log('Creating React root...');
// Create root and render app
const root = createRoot(container);
console.log('Rendering App component...');
root.render(<App />);
console.log('React render called!');
