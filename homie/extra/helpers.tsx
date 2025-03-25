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
        icon: <p className="aspect aspect-square text-center">🤝🏻</p>, 
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