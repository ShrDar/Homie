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
  };