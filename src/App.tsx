import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Components/Login";
import Layout from "./Components/Layout";
import Feed from "./Components/Feed";
import Content from "./Components/Content";
import Profile from "./Components/Profile";
import Community from "./Components/Community";
import CommunityFeed from "./Components/CommunityFeed"; // Import the new page

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
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;