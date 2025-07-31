import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "./Pages/Home"
import Login from "./components/Form/Login"
import Chat from "./pages/subpages/Chat"
import AddCreativeQuestionPage from "./pages/subpages/AddCq"
import CKEditor4 from "./pages/subpages/CKEditor"
import 'katex/dist/katex.min.css';
import SubjectsPage from "./pages/subpages/Subject"
import Qb from "./pages/subpages/Qb"
import Dashboard from "./pages/subpages/Dashboard"
import UnderConstruction from "./pages/errors/UnderConstruction"
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "/",
        element: <Dashboard />
      },
      {
        path: "/chat",
        element: <Chat />
      },
      {
        path: "/add-cq",
        element: <AddCreativeQuestionPage />
      },
      {
        path: "/qb",
        element: <SubjectsPage />
      }, 
      {
        path: "/questions/:level/:group/:subjectId",
        element: <Qb />
      },
      
       
      
      
      // Add more child routes here as needed
    ]
  },
  {
        path:'/manage-users',
        element: <UnderConstruction />
      },
  {
    path: "/login",
    element: <Login />
  }
  
])

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}