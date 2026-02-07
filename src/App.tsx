import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Feed from "./pages/Feed";
import Content from "./pages/Content";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import CommunityFeed from "./pages/CommunityFeed"; 
import Chat from "./pages/Chat";
import Career from "./pages/Career";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />
    },
    {
      path: "/home",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Content />
        },
        {
          path: "feed",
          element: <Feed />
        },
        {
          path: "profile",
          element: <Profile />
        },
        {
          path: "community",
          element: <Community />
        },
        {
          path: "community/:id",
          element: <CommunityFeed />
        },
        {
          path: "chat",
          element: <Chat />
        },
                {
          path: "career",
          element: <Career/>
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
