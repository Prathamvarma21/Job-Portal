import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Send } from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axios from "axios";
import { setMessages, setActiveChatUser, addMessage } from "../../../redux/chatSlice";
import { useSocket } from "../../context/SocketContext";
import { Avatar, AvatarImage } from "../ui/avatar";
import { USER_API_END_POINT } from "../../../utils/constant.js";

const MESSAGE_API_END_POINT = USER_API_END_POINT.replace("/api/v1/user", "/api/v1/message");

const ChatDialog = () => {
    const dispatch = useDispatch();
    const { activeChatUser, messages } = useSelector(store => store.chat);
    const { user } = useSelector(store => store.auth);
    const { socket } = useSocket();
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${MESSAGE_API_END_POINT}/get/${activeChatUser._id}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.log(error);
            }
        };

        if (activeChatUser) {
            fetchMessages();
        }
    }, [activeChatUser, dispatch]);

    // Socket message listener
    useEffect(() => {
        if (!socket) return;
        
        socket.on("newMessage", (msg) => {
            // Only add if the message belongs to the current active chat globally
            if(activeChatUser && msg.senderId === activeChatUser._id) {
                 dispatch(addMessage(msg));
            }
        });

        return () => socket.off("newMessage");
    }, [socket, activeChatUser, dispatch]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if(!newMessage.trim()) return;

        try {
            const res = await axios.post(`${MESSAGE_API_END_POINT}/send/${activeChatUser._id}`, { message: newMessage }, { withCredentials: true });
            
            if (res.data.success) {
                dispatch(addMessage(res.data.newMessage));
                setNewMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    };

    if (!activeChatUser) return null;

    return (
        <Dialog open={true} onOpenChange={() => dispatch(setActiveChatUser(null))}>
            <DialogContent className="sm:max-w-[425px] p-0 h-[500px] flex flex-col pt-0 gap-0">
                {/* Header */}
                <div className="flex items-center gap-3 p-3 border-b bg-gray-50 rounded-t-lg">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={activeChatUser.profile?.profilePhoto || "https://vector...jpg"} />
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{activeChatUser.fullname}</span>
                    </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {messages && messages.map((msg, index) => {
                        const isMe = msg.senderId === user?._id;
                        return (
                            <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`px-4 py-2 rounded-xl max-w-[80%] break-words ${isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-gray-200 text-black rounded-bl-none"}`}>
                                    {msg.message}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Input block */}
                <div className="p-3 border-t bg-gray-50 flex items-center gap-2 rounded-b-lg">
                    <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                        <Input 
                            type="text" 
                            placeholder="Type a message..." 
                            className="flex-1"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatDialog;
