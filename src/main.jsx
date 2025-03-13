import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TransactionsProvider } from "./context/TransactionContext";

createRoot(document.getElementById('root')).render(
  <TransactionsProvider>
    <App />
  </TransactionsProvider>,
)

// src/index.jsx
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
//
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//     <React.StrictMode>
//         <TransactionsProvider>
//         <App />
//         </TransactionsProvider>
//     </React.StrictMode>
// );
