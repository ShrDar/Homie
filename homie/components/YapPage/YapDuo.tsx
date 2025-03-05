"use client"
import { db } from "@/config/firebase";
import { getProfileUrl } from "@/extra/helpers";
import { HomieUser } from "@/homieTypes/homieTypes";
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, DocumentData, Timestamp, query, where, getDocs } from "firebase/firestore";
import { Session } from "next-auth";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { CiMenuKebab } from "react-icons/ci";
import TextareaAutosize from 'react-textarea-autosize';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
    id: string;
    yapId: string;
    senderId: string;
    content: string;
    timestamp: Timestamp;
    status: 'sent' | 'delivered' | 'read';
}

interface MessageGroup {
    date: string;
    messages: Message[];
}

export default function YapDuo({ session } : { session: Session }) {
    const params = useParams();
    const { yapId } = params;
    const [yapper1, setYapper1] = useState<HomieUser>(); //currentUser
    const [yapper2, setYapper2] = useState<HomieUser>(); //friendUser
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [yapData, setYapData] = useState<any>(null);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showSeen, setShowSeen] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Scroll when messages update

    useEffect(() => {
        const yapCollection = collection(db, 'Yap');
        const messagesCollection = collection(db, 'Messages');
        
        // Subscribe to yap data
        const unsubscribeYap = onSnapshot(yapCollection, (querySnapshot) => {
            const yapsList = querySnapshot.docs.map(doc => doc.data());
            const filtered = yapsList.filter((yap) => yap.yapId === yapId);
            setYapData(filtered);

            filtered[0]?.participants.map(async(participantId : string) => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${participantId}`);
                const fetchedUser = await response.json();
                if(fetchedUser._id === session?.user?.id) {
                    setYapper1(fetchedUser)
                } else {
                    setYapper2(fetchedUser)
                }
            })
        });

        // Subscribe to messages and track seen status
        const unsubscribeMessages = onSnapshot(messagesCollection, (querySnapshot) => {
            const messagesList = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Message))
                .filter(msg => msg.yapId === yapId)
                .sort((a, b) => a.timestamp?.toMillis() - b.timestamp?.toMillis());
            
            setMessages(messagesList);

            // Check if the last message is from current user and is seen
            if (messagesList.length > 0) {
                const lastMessage = messagesList[messagesList.length - 1];
                if (lastMessage.senderId === session?.user?.id && lastMessage.status === 'read') {
                    setShowSeen(true);
                } else {
                    setShowSeen(false);
                }
            }
        });

        // Mark messages as read
        const markAsRead = async () => {
            const messagesRef = collection(db, 'Messages');
            const q = query(messagesRef, where('yapId', '==', yapId));
            const querySnapshot = await getDocs(q);

            querySnapshot.docs.forEach(async (doc) => {
                const data = doc.data();
                if (data.senderId !== session?.user?.id && data.status !== 'read') {
                    await updateDoc(doc.ref, { status: 'read' });
                }
            });
        };

        // Set up interval to mark messages as read
        const readInterval = setInterval(markAsRead, 2000);
        
        return () => {
            unsubscribeYap();
            unsubscribeMessages();
            clearInterval(readInterval);
        };
    }, [yapId, session?.user?.id]);

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    const sendMessage = async (e: React.FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        if (!newMessage.trim() || !yapId || !session?.user?.id) return;

        try {
            await addDoc(collection(db, 'Messages'), {
                yapId,
                senderId: session.user.id,
                content: newMessage.replace(/\n$/, ''),
                timestamp: serverTimestamp(),
                status: 'sent'
            });

            const previewText = newMessage.replace(/\n/g, ' ').trim();
            const yapRef = doc(db, 'Yap', yapId as string);
            await updateDoc(yapRef, {
                lastMessage: previewText,
                lastMessageTime: serverTimestamp(),
                lastSenderId: session.user.id
            });

            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const formatMessageTime = (timestamp: Timestamp | null) => {
        if (!timestamp) return '';
        
        const messageDate = timestamp.toDate();
        const now = new Date();
        const hoursDiff = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 1) {
            const minutes = Math.floor(hoursDiff * 60);
            return `${minutes}m`;
        } else if (hoursDiff < 24) {
            const hours = Math.floor(hoursDiff);
            return `${hours}h`;
        } else if (hoursDiff < 168) { // 7 days
            const days = Math.floor(hoursDiff / 24);
            return `${days}d`;
        } else {
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const unsendMessage = async (messageId: string) => {
        try {
            await deleteDoc(doc(db, 'Messages', messageId));
        } catch (error) {
            console.error("Error unsending message:", error);
        }
    };

    const groupMessagesByDate = (messages: Message[]): MessageGroup[] => {
        const groups: { [key: string]: Message[] } = {};
        
        messages.forEach(message => {
            if (!message.timestamp) return;
            
            const date = message.timestamp.toDate().toLocaleDateString([], { 
                weekday: 'short', 
                hour: 'numeric', 
                minute: 'numeric',
                hour12: true 
            });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });

        return Object.entries(groups).map(([date, messages]) => ({
            date,
            messages
        }));
    };

    return (
        <div className="w-full h-[80dvh] z-[10] flex bg-bgSecondary text-fontPrimary rounded-[15px] p-5 flex-col justify-center items-center gap-2">
            <div className="yapTopBar w-full flex justify-start items-center gap-2">
                <div className="rounded-full overflow-hidden bg-bgPrimary p-2">
                    <Image 
                        src={getProfileUrl(yapper2?.image || "")}
                        alt=""
                        width={100}
                        height={100}
                        className="w-[40px] rounded-full object-cover aspect-square"
                    />
                </div>
                <div className="flex flex-col justify-center items-start">
                    <p className="text-lg tracking-[1px] let">{yapper2?.name}</p>
                    <p className="text-xs tracking-[3px]">@{yapper2?.username}</p>
                </div>
            </div>

            <div className="yapsContainer relative w-full bg-bgPrimary h-[70dvh] overflow-auto rounded-[15px] flex flex-col justify-start items-center p-4">
                <div className="w-full flex flex-col gap-1">
                    {groupMessagesByDate(messages).map((group, groupIndex) => {
                        // Get all messages from current user
                        const userMessages = messages.filter(msg => msg.senderId === session?.user?.id);
                        // Get the last message ID from current user
                        const lastUserMessageId = userMessages.length > 0 ? userMessages[userMessages.length - 1].id : null;

                        return (
                            <div key={groupIndex} className="w-full flex flex-col gap-1 mb-4">
                                <div className="w-full text-center mb-2">
                                    <span className="text-xs opacity-40 px-2 py-1">
                                        {group.date}
                                    </span>
                                </div>
                                {group.messages.map((message, messageIndex) => {
                                    const isFirstInGroup = messageIndex === 0 || 
                                        group.messages[messageIndex - 1]?.senderId !== message.senderId;
                                    const showAvatar = message.senderId !== session?.user?.id && isFirstInGroup;
                                    
                                    // Only show seen status if this is the last message from current user
                                    const isLastUserMessage = message.id === lastUserMessageId;
                                    const showSeenForMessage = showSeen && isLastUserMessage;

                                    return (
                                        <div key={message.id} className="w-full flex flex-col">
                                            <div className={`w-full flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'} items-end gap-2 mb-[2px]`}>
                                                {showAvatar ? (
                                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                        <Image 
                                                            src={getProfileUrl(yapper2?.image || "")}
                                                            alt=""
                                                            width={32}
                                                            height={32}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 flex-shrink-0" />
                                                )}
                                                
                                                <div className={`group relative max-w-[65%] ${!showAvatar && message.senderId !== session?.user?.id ? '' : ''}`}>
                                                    {message.senderId === session?.user?.id && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[24px] opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger>
                                                                    <div className="p-1 hover:bg-bgSecondary rounded-full transition-colors">
                                                                        <CiMenuKebab size={14} className="text-fontPrimary opacity-60" />
                                                                    </div>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="start" side="left" sideOffset={8} className="bg-bgPrimary text-fontPrimary text-sm border-[#666] p-1">
                                                                    <div onClick={() => unsendMessage(message.id)} className="sulphur cursor-pointer">
                                                                        <p className="w-full text-center hover:bg-[#1B1B1B] p-1 rounded-[6px] text-[#FF6F6F]">
                                                                            Unsend
                                                                        </p>
                                                                    </div>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    )}
                                                    <div className={`px-4 py-2 rounded-[20px] ${
                                                        message.senderId === session?.user?.id 
                                                            ? 'bg-bgSecondary text-fontPrimary' 
                                                            : 'bg-[#1b1b1b] text-fontPrimary'
                                                    }`}>
                                                        <p className="text-[15px] leading-5 whitespace-pre-wrap">{message.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Seen indicator below the last message from current user */}
                                            {showSeenForMessage && (
                                                <div className="w-full flex justify-end mt-1">
                                                    <div className="w-3 h-3 rounded-full overflow-hidden flex-shrink-0">
                                                        <Image 
                                                            src={getProfileUrl(yapper2?.image || "")}
                                                            alt=""
                                                            width={12}
                                                            height={12}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                <div ref={messagesEndRef} />
            </div>

            <div className="yapTypeSection w-full">
                <form onSubmit={sendMessage} className="flex gap-2 items-end">
                    <div className="flex w-full items-center justify-center relative">
                        <TextareaAutosize
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            minRows={1}
                            maxRows={4}
                            className="w-full bg-bgPrimary text-fontPrimary selection:bg-bgSecondary rounded-[15px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#666] resize-none leading-5"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-bgPrimary text-fontPrimary px-6 h-10 rounded-full hover:bg-[#1b1b1b] transition-colors flex items-center justify-center"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

// setYapData(yapsList);  
          
         