import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./Root";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CreatePost from "./pages/CreatePost";
import PostDetails from "./pages/PostDetails";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Root />
    ),
    children: [
      { path: "/", element: 
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
      },

      { path: "/create-post", element: 
        <ProtectedRoute>
          <CreatePost />
        </ProtectedRoute>
       },

      { path: "/post-details/:id", element: 
        <ProtectedRoute>
          <PostDetails />
        </ProtectedRoute>
       },
    ],
  },

  { path: "/signin", element: <SignIn /> },

  { path: "/signup", element: <SignUp /> },
]);


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
