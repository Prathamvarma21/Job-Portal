import { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import { setOnlineUsers } from "../../redux/chatSlice.js";
import { USER_API_END_POINT } from "../../utils/constant.js";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user) {
            // Using the base domain logic of your backend
            // In dev it's localhost:8000. For modularity, we construct it:
            const backendUrl = USER_API_END_POINT.replace("/api/v1/user", "");
            
            const socketInstance = io(backendUrl, {
                query: {
                    userId: user._id
                }
            });

            setSocket(socketInstance);

            socketInstance.on("getOnlineUsers", (users) => {
                dispatch(setOnlineUsers(users));
            });

            return () => socketInstance.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user, dispatch]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
