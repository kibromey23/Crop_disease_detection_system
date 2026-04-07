import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Note: App.css is imported inside App.jsx — no duplicate import here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
