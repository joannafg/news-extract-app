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
          borderRadius: 2,

          // Alias Token
          colorBgContainer: '#ffffff',
        },
      }}
    >
      {/* <div className='gradient_background'> */}

      <Space direction="vertical" size="large" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        {/* <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}> */}
        <Home />
        <div
          style={{
            color: '#889900',
            backgroundColor: '#889900',
            borderColor: '#889900',
            height: 1,
            width: 600,
          }}
        />
        <Text type="secondary">©2023 Avocado LLC</Text>
        {/* </div> */}
      </Space>
      {/* </div> */}
    </ConfigProvider>
  );
}

export default App;
