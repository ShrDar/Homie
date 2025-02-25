export type HomieUser = {
    _id: string;
    name: string;
    email: string;
    hashedPassword: string; 
    image: string; 
    username: string;
    role: 'USER' | 'ADMIN' | string; 
    createdAt: string; 
    updatedAt: string;
    bio: string;
    homies: string[];
    homieSentRequests: string[];
    homieRequests: string[];
    yaps: Yap[];
  };

  type Yap = {
    yapId: string;
    participants: string[];
    lastMessage: string;
    lastMessageTime: Date | null;
    unreadCount: number;
    lastSenderId: string;
    status: 'sent' | 'delivered' | 'read'; // Assuming 'sent', 'delivered', or 'read' are possible statuses
  };