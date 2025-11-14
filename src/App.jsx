import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./components/form/Login"
import Chat from "./pages/subpages/Chat"
import AddCreativeQuestionPage from "./pages/subpages/AddCq"
import 'katex/dist/katex.min.css';
import SubjectsPage from "./pages/subpages/Subject"
import Qb from "./pages/subpages/Qb"
import Dashboard from "./pages/subpages/Dashboard"
import UnderConstruction from "./pages/errors/UnderConstruction"
import ViewQuestion from "./pages/subpages/ViewQuestion"
import SubjectManagementPage from "./components/Subject/SubjectManagementPage"
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
        path: "/add-cq",
        element: <AddCreativeQuestionPage />
      },
      {
        path: "/subjects",
        element: <SubjectsPage />
      }, 
      {
        path: "/questions/:level/:group/:subjectId",     //curent page with all questions 
        element: <Qb />
      },
       {
        path: "/questions/:level/:group/:subjectId/:questionId", //required page to view and edit a single question
        element: <ViewQuestion />
      },
       {
        path:'/subject/:id',
        element: <SubjectManagementPage />
       },
        {
        path:'/settings',
        element: <UnderConstruction />
       }
      
      
      
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
