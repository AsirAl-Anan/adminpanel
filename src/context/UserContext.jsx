import { createContext, useEffect, useState } from "react";
import axios from "axios";


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
      const res = await axios.get(import.meta.env.VITE_API_URL + "/auth/get-user", {
        withCredentials: true,
      });
      /**
       * Checks if the response is successful and if the user data is in the response.
       * If the response is not successful or the user data is not in the response,
       * the function does not update the user state.
       */
      if (res?.data?.success !== true) return;
      /**
       * Updates the user state with the user data from the response.
       */
      setUser(res?.data?.admin);
    } catch (error) {
      /**
       * Logs the error to the console if there is an error while fetching the user data.
       */
      console.log("error while fetching user: ", error);
    }
  };
  /**
   * Uses the useEffect hook to fetch the user data when the component mounts.
   * The useEffect hook takes a function as an argument, which is the effect to run.
   * The useEffect hook also takes an array of dependencies as an argument, which determines when the effect should run.
   * In this case, the effect runs when the component mounts, because the dependencies array is empty.
   */
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
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

