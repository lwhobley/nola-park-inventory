import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('index.js loaded');

// Find root element
const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<h1>ERROR: Root element not found</h1>';
} else {
  try {
    console.log('Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('Rendering App...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    document.body.innerHTML = '<h1>ERROR: ' + error.message + '</h1><p>' + error.stack + '</p>';
  }
}
