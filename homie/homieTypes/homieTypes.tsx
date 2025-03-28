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

  export type Post = {
    _id: string;
    title: string;
    content: string;
    userId: string;
    image?: string;
    commentId?: string;
    reactions: Reaction[];
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
  };

  export type Reaction = {
    reactionType: string;
    reactUserId: string;
}

export type ReactionButton = {
  icon: any;
  label: string;
  color: string;
  gradient?: string;
  type: string;
  fontColor: string;
}

export type Tea = {
  _id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  discussionId: string;  
  image?: string;
  tags: string[];
  isOpen: boolean;
}