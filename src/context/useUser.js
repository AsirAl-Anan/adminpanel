import { useContext } from "react";
import { UserContext } from "./UserContext.jsx";


const useUser = () => {
    return useContext(UserContext);
};

export default useUser;
