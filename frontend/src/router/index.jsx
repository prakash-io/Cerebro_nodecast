import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";

import Home from "../pages/Home.jsx";
import CreateRoom from "../pages/CreateRoom.jsx";
import JoinRoom from "../pages/JoinRoom.jsx";
import BroadcasterPanel from "../pages/BroadcasterPanel.jsx";
import ListenerView from "../pages/ListenerView.jsx";
import ListenerScreen from "../pages/ListenerScreen.jsx";
import NetworkDebug from "../pages/NetworkDebug.jsx";
import Error404 from "../pages/Error404.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error404 />,
    children: [
      { index: true, element: <Home /> },

      // CREATE ROOM
      { path: "create", element: <CreateRoom /> },
      { path: "create-room", element: <CreateRoom /> },

      // JOIN ROOM
      { path: "join", element: <JoinRoom /> },
      { path: "join-room", element: <JoinRoom /> },

      // BROADCASTER
      { path: "broadcaster/:roomCode", element: <BroadcasterPanel /> },

      // LISTENER
      { path: "listener/:roomCode", element: <ListenerView /> },

      // FULL SCREEN LISTENER
      { path: "listener/:roomCode/screen", element: <ListenerScreen /> },

      // DEBUG PANEL
      { path: "network-debug/:roomCode", element: <NetworkDebug /> },
    ],
  },
]);
