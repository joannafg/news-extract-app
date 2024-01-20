import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './components/home';
import { Divider, Space, Typography, ConfigProvider } from 'antd';

const { Text, Link } = Typography;

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#889900',
          borderRadius: 10,

          // Alias Token
          colorBgContainer: '#ffffff',
        },
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'auto',
        padding: '20px 20px',
        background: 'linear-gradient(#bec489, #ffffff)'
      }}>
        <div style={{ width: '50%' }}>
          <Home />
        </div>
        <div style={{ height: '20px' }} />
        <div
          style={{
            color: '#889900',
            backgroundColor: '#889900',
            borderColor: '#889900',
            height: 1,
            width: 600,
          }}
        />
        <Text type="secondary">©2024 Avocado LLC</Text>
      </div>
    </ConfigProvider>
  );
}

export default App;
