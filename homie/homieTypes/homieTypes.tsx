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
    friends: string[];
  };