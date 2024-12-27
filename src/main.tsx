import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigApp } from './apps/ConfigApp';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { InjectStyle } from './natived';
import { Settings } from './pages/Settings';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Workspace } from './pages/Workspaces';
import { Documents } from './pages/Documents';
import { CreateWorkspace } from './pages/CreateWorkspace';
const VITE_PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL;
console.log(`build time:${import.meta.env.VITE_APP_BUILD_TIME}`);
InjectStyle(`
body{
  margin:0;
}
.ant-btn:not(:disabled):focus-visible {
  outline: none;
}
`);
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={VITE_PUBLIC_URL}>
      <Routes>
        {/* <Route path="/" element={<App></App>} /> */}
        <Route path="/" element={<Home style={{ width: '100vw', height: '100vh' }} />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/workspaces" element={<Workspace />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/create-workspace" element={<CreateWorkspace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>

);