import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './components/home';

function App() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <Home />
    </div>
  );
}

export default App;
