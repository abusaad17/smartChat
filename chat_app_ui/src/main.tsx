import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Error from "./components/Error.tsx";
import Signup from "./pages/Signup.tsx";
import Home from "./pages/Home.tsx";
import Chat from "./pages/Chat.tsx";
import SocketProvider from "./context/SocketProvider.tsx";
import AuthProvider from "./context/AuthProvider.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "chat/:id",
        element: <Chat />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <AuthProvider>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
    </AuthProvider>
  // {/* </React.StrictMode> */}
);
