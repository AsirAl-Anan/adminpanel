import { createContext, useEffect, useState } from "react";
import axios from "../config/axios.js"

export const UserContext = createContext();

/**
 * This component provides a context for the user data.
 * It fetches the user data from the server and stores it in the state.
 * The context provides a value object with the user data and a function to update the user data.
 * The Provider component wraps the app and provides the context to all components.
 * @param {Object} props The props for the component.
 * @param {Node} children The child components.
 * @returns {Node} The component.
 */
export const UserProvider = ({ children }) => {
  /**
   * The user data. 
   * null = loading, false = not authenticated, object = authenticated user
   */
  const [user, setUser] = useState(null);

  /**
   * Fetches the user data from the server.
   */
  const fetchUser = async () => {
    try {
      /**
       * Sends a GET request to the server to fetch the user data.
       * The request is sent with the withCredentials option set to true
       * to include the authentication cookies in the request.
       */
      const res = await axios.get("/auth/get-user");
      
      /**
       * Checks if the response is successful and if the user data is in the response.
       * If successful, update user state with the user data.
       * If not successful, set user to false (not authenticated).
       */
      if (res?.data?.success === true && res?.data?.admin) {
        setUser(res.data.admin);
      } else {
        setUser(false); // Not authenticated
      }
    } catch (error) {
      /**
       * If there's an error (like 401 Unauthorized), set user to false
       * to indicate the user is not authenticated.
       */
      console.log("error while fetching user: ", error);
      setUser(false); // Not authenticated
    }
  };

  /**
   * Uses the useEffect hook to fetch the user data when the component mounts.
   * The useEffect hook takes a function as an argument, which is the effect to run.
   * The useEffect hook also takes an array of dependencies as an argument, which determines when the effect should run.
   * In this case, the effect runs when the component mounts, because the dependencies array is empty.
   */
  useEffect(() => {
    fetchUser();
  }, []);

  /**
   * The value object that is provided to the context.
   * The value object contains the user data and a function to update the user data.
   */
  const value = {
    user,
    setUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
