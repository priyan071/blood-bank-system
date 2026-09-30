import React from 'react';
import { Outlet } from 'react-router-dom';
import DemoBar from './DemoBar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DemoBar />
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 40px)' }}>
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
