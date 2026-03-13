import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const CreateRoom = lazy(() => import("../pages/CreateRoom"));
const JoinRoom = lazy(() => import("../pages/JoinRoom"));
const BroadcasterPanel = lazy(() => import("../pages/BroadcasterPanel"));
const ListenerView = lazy(() => import("../pages/ListenerView"));
const ListenerScreen = lazy(() => import("../pages/ListenerScreen"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Analytics = lazy(() => import("../pages/Analytics"));
const NetworkDebug = lazy(() => import("../pages/NetworkDebug"));
const Settings = lazy(() => import("../pages/Settings"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const Help = lazy(() => import("../pages/Help"));
const Blog = lazy(() => import("../pages/Blog"));
const Contact = lazy(() => import("../pages/Contact"));
const Error404 = lazy(() => import("../pages/Error404"));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/create-room" element={<CreateRoom />} />
      <Route path="/join-room" element={<JoinRoom />} />
      <Route path="/broadcaster/:roomCode" element={<BroadcasterPanel />} />
      <Route path="/listener/:roomCode" element={<ListenerView />} />
      <Route path="/listener/:roomCode/screen" element={<ListenerScreen />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/network-debug/:roomCode" element={<NetworkDebug />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/help" element={<Help />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}
