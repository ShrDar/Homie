import { storage } from "@/config/AppWriteClient";
import { ReactionButton } from "@/homieTypes/homieTypes";

export const getProfileUrl = (image: string) => {
    if(image.startsWith("htt") || image.startsWith("blob")) {
        return image;
    }
    if(!image) {
        return "/figmaIcons/profilePicSkeleton.svg";
    }
    // console.log(image);
    const imageUrl = storage.getFileView(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", image)
    return imageUrl;
}

export const reactionButtons: ReactionButton[] = [
    { 
        icon: <p className="aspect aspect-square text-center rotate-180">🤝🏻</p>, 
        label: 'Dap', 
        type: 'dap',
        color: '#4CAF50',
        gradient: 'linear-gradient(45deg, #4CAF50, #45a049)',
        fontColor: '#fff'
    },
    { 
        icon: <p className="aspect aspect-square text-center">🔥</p>, 
        label: 'Fire', 
        type: 'love',
        color: '#E12929',
        gradient: 'linear-gradient(45deg, #f6630c, #DC2626)',
        fontColor: '#fff'
    },
    { 
        icon: <p className="aspect aspect-square text-center">😆</p>, 
        label: 'Laugh', 
        type: 'laugh',
        color: '#FFB100',
        gradient: 'linear-gradient(45deg, #FFB100, #FF8A00)',
        fontColor: '#000'
    },
    { 
        icon: <p className="aspect aspect-square text-center">😒</p>, 
        label: 'Pissed', 
        type: 'pissed',
        color: '#EF4444',
        gradient: 'linear-gradient(45deg, #EF4444, #DC2626)',
        fontColor: '#fff'
    },
    { 
        icon: <p className="aspect aspect-square text-center">🤨</p>, 
        label: 'Sus', 
        type: 'sus',
        color: '#8B5CF6',
        gradient: 'linear-gradient(45deg, #8B5CF6, #6D28D9)',
        fontColor: '#fff'
    },
];

export function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}hr ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }