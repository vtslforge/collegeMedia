import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Feed from "./pages/Feed";
import Content from "./pages/Content";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/home",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Content />,   // default hero page
        },
        {
          path: "feed",
          element: <Feed />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
