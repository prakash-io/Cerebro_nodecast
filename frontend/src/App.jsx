import { Outlet, useLocation } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';

function App() {
  const location = useLocation();
  const isRoomRoute =
    location.pathname.startsWith('/broadcaster/') ||
    location.pathname.startsWith('/listener/') ||
    location.pathname.startsWith('/network-debug/');

  if (isRoomRoute) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-black text-[#ff0033] font-orbitron">
        <div className="crt-overlay pointer-events-none z-50"></div>
        <div className="noise-bg pointer-events-none z-40"></div>
        <div className="pointer-events-none fixed inset-0 z-30 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--color-hw-neon-red)_0%,_transparent_70%)] mix-blend-screen"></div>
        <Outlet />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="crt-overlay pointer-events-none z-50"></div>
      <div className="noise-bg pointer-events-none z-40"></div>
      <div className="pointer-events-none fixed inset-0 z-30 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--color-hw-neon-red)_0%,_transparent_70%)] mix-blend-screen"></div>
      <Outlet />
    </AppLayout>
  );
}

export default App;
