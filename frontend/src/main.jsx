import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";


import Root from './Root';
import Home from './pages/Home'
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp'
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';



const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/create-post",
        element: <CreatePost />,
      },
      {
        path: "/post-details/:id",
        element: <PostDetails />,
      },
    ]
  },

  {
    path: "/signin",
    element: <SignIn />,
  },

  {
    path: "/signup",
    element: <SignUp />,
  },
  
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
