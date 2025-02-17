import { storage } from "@/config/AppWriteClient";

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