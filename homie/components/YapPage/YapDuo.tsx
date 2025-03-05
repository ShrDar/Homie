"use client"
import { db } from "@/config/firebase";
import { getProfileUrl } from "@/extra/helpers";
import { HomieUser } from "@/homieTypes/homieTypes";
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, Timestamp, query, where, getDocs, getDoc } from "firebase/firestore";
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
import { IoIosImages } from "react-icons/io";
import { ID, storage } from "@/config/AppWriteClient";
import { toast } from "sonner";
import { RxCross2 } from "react-icons/rx";
import GifPicker from "./GifPicker";

interface Message {
    id: string;
    yapId: string;
    senderId: string;
    content: string;
    timestamp: Timestamp;
    status: 'sent' | 'delivered' | 'read';
    type: 'text' | 'image' | 'gif';
    imageId?: string;
    gifUrl?: string;
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
    // const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showSeen, setShowSeen] = useState(false);
    // const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Scroll when messages update

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
        }
    }, []);

    console.log(yapper1, yapData)
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

        const unsubscribeMessages = onSnapshot(messagesCollection, (querySnapshot) => {
            const messagesList = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Message))
                .filter(msg => msg.yapId === yapId)
                .sort((a, b) => a.timestamp?.toMillis() - b.timestamp?.toMillis());
            
            setMessages(messagesList);

            if (messagesList.length > 0) {
                const lastMessage = messagesList[messagesList.length - 1];
                if (lastMessage.senderId === session?.user?.id && lastMessage.status === 'read') {
                    setShowSeen(true);
                } else {
                    setShowSeen(false);
                }
            }
        });

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

        const readInterval = setInterval(markAsRead, 2000);
        
        return () => {
            unsubscribeYap();
            unsubscribeMessages();
            clearInterval(readInterval);
        };
    }, [yapId, session?.user?.id]);

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    const sendMessage = async (e: React.FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        
        if (selectedFile) {
            await sendImageMessage(selectedFile);
            setImagePreview(null);
            setSelectedFile(null);
            return;
        }

        if (!newMessage.trim() || !yapId || !session?.user?.id) return;

        try {
            // Existing Firebase code
            await addDoc(collection(db, 'Messages'), {
                yapId,
                senderId: session.user.id,
                content: newMessage.replace(/\n$/, ''),
                timestamp: serverTimestamp(),
                status: 'sent',
                type: 'text'
            });

            const previewText = newMessage.replace(/\n/g, ' ').trim();
            const yapRef = doc(db, 'Yap', yapId as string);
            await updateDoc(yapRef, {
                lastMessage: previewText,
                lastMessageTime: serverTimestamp(),
                lastSenderId: session.user.id
            });

            // Add MongoDB update
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/yaps/${session.user.id}/update-yap/${yapId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lastMessage: previewText,
                    lastMessageTime: new Date().toISOString(),
                    lastSenderId: session.user.id,
                    status: 'sent',
                    participants: yapData[0].participants
                }),
            });

            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // const formatMessageTime = (timestamp: Timestamp | null) => {
    //     if (!timestamp) return '';
        
    //     const messageDate = timestamp.toDate();
    //     const now = new Date();
    //     const hoursDiff = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    //     if (hoursDiff < 1) {
    //         const minutes = Math.floor(hoursDiff * 60);
    //         return `${minutes}m`;
    //     } else if (hoursDiff < 24) {
    //         const hours = Math.floor(hoursDiff);
    //         return `${hours}h`;
    //     } else if (hoursDiff < 168) { // 7 days
    //         const days = Math.floor(hoursDiff / 24);
    //         return `${days}d`;
    //     } else {
    //         return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    //     }
    // };

    const unsendMessage = async (messageId: string) => {
        try {
            // First get the message data to check if it has an image
            const messageDoc = doc(db, 'Messages', messageId);
            const messageSnapshot = await getDoc(messageDoc);
            const messageData = messageSnapshot.data();

            // If message has an imageId, delete from Appwrite storage first
            if (messageData?.type === 'image' && messageData?.imageId) {
                try {
                    await storage.deleteFile(
                        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", 
                        messageData.imageId
                    );
                } catch (error) {
                    console.error("Error deleting image from storage:", error);
                    toast.error("Failed to delete image");
                }
            }

            // Delete message from Firebase
            await deleteDoc(messageDoc);

            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/yaps/${session?.user?.id}/update-yap/${yapId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lastMessage: "Message Unsent",
                    lastMessageTime: new Date().toISOString(),
                    lastSenderId: yapper1?._id,
                    status: 'sent',
                    participants: yapData[0].participants
                }),
            });

        } catch (error) {
            console.error("Error unsending message:", error);
            toast.error("Failed to unsend message");
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

    const handleImageSelect = async (file: File | undefined) => {
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (1MB limit)
        const maxSizeInMB = 1;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            toast.error("Image size should be less than 1MB");
            return;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setSelectedFile(file);
    };

    const sendImageMessage = async (file: File) => {
        if (!yapId || !session?.user?.id) return;

        try {
            // Upload to Appwrite storage
            const imageId = ID.unique();
            await storage.createFile(
                process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", 
                imageId, 
                file
            );

            // Add message to Firebase with caption
            await addDoc(collection(db, 'Messages'), {
                yapId,
                senderId: session.user.id,
                content: newMessage.trim(), // Add the caption from newMessage
                imageId: imageId,
                timestamp: serverTimestamp(),
                status: 'sent',
                type: 'image'
            });

            // Update last message in Yap
            const yapRef = doc(db, 'Yap', yapId as string);
            await updateDoc(yapRef, {
                lastMessage: newMessage.trim() ? `📷 Image: ${newMessage}` : '📷 Image',
                lastMessageTime: serverTimestamp(),
                lastSenderId: session.user.id
            });

            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/yaps/${session.user.id}/update-yap/${yapId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lastMessage: "Image",
                    lastMessageTime: new Date().toISOString(),
                    lastSenderId: session.user.id,
                    status: 'sent',
                    participants: yapData[0].participants
                }),
            });

            // Clear both image and text
            setNewMessage("");
            // toast.success("Image sent successfully");
        } catch (error) {
            console.error("Error sending image:", error);
            toast.error("Failed to send image");
        }
    };

    const sendGifMessage = async (gif: any) => {
        if (!yapId || !session?.user?.id) return;

        try {
            // Add message to Firebase
            await addDoc(collection(db, 'Messages'), {
                yapId,
                senderId: session.user.id,
                content: newMessage.trim(), // Optional caption
                gifUrl: gif.images.original.url,
                timestamp: serverTimestamp(),
                status: 'sent',
                type: 'gif'
            });

            // Update last message in Yap
            const yapRef = doc(db, 'Yap', yapId as string);
            await updateDoc(yapRef, {
                lastMessage: newMessage.trim() ? `🎭 GIF: ${newMessage}` : '🎭 GIF',
                lastMessageTime: serverTimestamp(),
                lastSenderId: session.user.id
            });

            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/yaps/${session.user.id}/update-yap/${yapId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lastMessage: "GIF",
                    lastMessageTime: new Date().toISOString(),
                    lastSenderId: session.user.id,
                    status: 'sent',
                    participants: yapData[0].participants
                }),
            });

            setNewMessage("");
            // toast.success("GIF sent successfully");
        } catch (error) {
            console.error("Error sending GIF:", error);
            toast.error("Failed to send GIF");
        }
    };

    // Add cleanup for preview URL in useEffect
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);


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
                                                    <div className={`${message.type === "gif" || message.type === "image" ? "px-2" : "px-4"} py-2 rounded-[20px] ${
                                                        message.senderId === session?.user?.id 
                                                            ? 'bg-bgSecondary text-fontPrimary overflow-hidden' 
                                                            : 'bg-[#1b1b1b] text-fontPrimary'
                                                    }`}>
                                                        {message.type === 'image' ? (
                                                            <div className="flex flex-col gap-2">
                                                                <div className="relative w-[200px] h-[200px]">
                                                                    <Image 
                                                                        src={getProfileUrl(message.imageId || "")}
                                                                        alt="Sent image"
                                                                        fill
                                                                        className="object-cover rounded-[15px]"
                                                                    />
                                                                </div>
                                                                {message.content && (
                                                                    <p className="text-[15px] leading-5 whitespace-pre-wrap px-2">
                                                                        {message.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : message.type === 'gif' ? (
                                                            <div className="flex justify-center items-center flex-col gap-2">
                                                                <div className="relative">
                                                                    <Image 
                                                                        src={message.gifUrl || ""}
                                                                        alt="GIF"
                                                                        width={200}
                                                                        height={200}
                                                                        className="rounded-[15px]"
                                                                        unoptimized
                                                                    />
                                                                </div>
                                                                {message.content && (
                                                                    <p className="text-[15px] leading-5 whitespace-pre-wrap px-2">
                                                                        {message.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[15px] leading-5 whitespace-pre-wrap text-center">{message.content}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
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
                <form onSubmit={sendMessage} className="flex flex-col gap-2">
                    {imagePreview && (
                        <div className="relative w-full flex justify-start items-center gap-2 bg-bgPrimary p-2 rounded-[15px]">
                            <div className="relative w-[100px] h-[100px]">
                                <Image 
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover rounded-[10px]"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setImagePreview(null);
                                    setSelectedFile(null);
                                }}
                                className="absolute top-1 right-1 p-1 rounded-full bg-[#FF6F6F] hover:brightness-90"
                            >
                                <RxCross2 size={12} color="white"/>
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2 items-center">
                        <div className="flex w-full items-center justify-center relative">
                            <TextareaAutosize
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={selectedFile ? "Write Smth..." : "Yap Smth..."}
                                minRows={1}
                                maxRows={4}
                                className="w-full bg-bgPrimary text-fontPrimary selection:bg-bgSecondary overflow-hidden rounded-[15px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#666] resize-none leading-5"
                            />
                        </div>
                        <div className="flex relative justify-center items-center gap-2">
                            <label htmlFor="imageInput" className="cursor-pointer hover:brightness-[8] transition-all duration-100 flex justify-center items-center gap-2 border-[2px] border-[#666] p-2 rounded-full">
                                <IoIosImages color="#666" size={15}/>
                            </label>
                            <input 
                                id="imageInput"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageSelect(e.target.files?.[0])}
                            />
                            <div 
                                onClick={() => setShowGifPicker(true)}
                                className="cursor-pointer hover:brightness-[8] transition-all duration-100 flex justify-center items-center gap-2 border-[2px] border-[#666] p-2 rounded-full"
                            >
                                <p className="text-[8px] text-[#666] tracking-[2px] aspect-square flex items-center justify-center">GIF</p>
                            </div>
                            <GifPicker
                                isOpen={showGifPicker}
                                onClose={() => setShowGifPicker(false)}
                                onGifSelect={sendGifMessage}
                                showGifPicker={showGifPicker}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-bgPrimary text-fontPrimary px-6 h-10 rounded-full hover:bg-[#1b1b1b] transition-colors flex items-center justify-center"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
            
        </div>
    );
}

// setYapData(yapsList);
          
         