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
import { SaveToWorkspace } from './pages/SaveToWorkspace';
import { CheckInFromCad } from './pages/CheckInFromCad';
import { CheckInFromWorkbench } from './pages/CheckInFromWorkbench';
import { DownloadFromWorkbench } from './pages/DownloadFromWorkbench';
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
        <Route path="/save-to-workspace" element={<SaveToWorkspace />} />
        <Route path="/check-in-from-cad" element={<CheckInFromCad />} />
        <Route path="/check-in-from-workbench" element={<CheckInFromWorkbench />} />
        <Route path="/download-from-workbench" element={<DownloadFromWorkbench />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>

);