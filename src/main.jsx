import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { UserProvider } from "./context/UserContext.jsx"
import { Toaster } from "../components/ui/sonner"

// Custom hook to detect screen size
function useResponsivePosition() {
  const [position, setPosition] = useState(getPosition());

  function getPosition() {
    if (window.innerWidth < 1024) return "top-center"; // medium or small
    return "bottom-right"; // large
  }

  useEffect(() => {
    const handleResize = () => setPosition(getPosition());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return position;
}

function Root() {
  const position = useResponsivePosition();

  return (
    <UserProvider>
      <Toaster position={position} />
      <App />
    </UserProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
