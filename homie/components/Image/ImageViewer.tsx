
export default function ImageViewer( {image, setOpenImageViewer} : {image: string, setOpenImageViewer: any} ) {
    return (
        <>
            <div 
                onClick={() => {
                    setOpenImageViewer(false)
                }} 
                className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            />

            <div>

            </div>
        </>
    )
}