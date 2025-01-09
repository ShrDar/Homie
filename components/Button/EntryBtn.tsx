type EntryBtnProps = {
    name: string,
    click?: any
}

export default function EntryBtn({name,click = () => console.log('no action')} : EntryBtnProps) {
    return (
        <button onClick={click} className="entryBtn w-full text-center flex justify-center items-center sulphur text-[#fff] rounded-[6px] py-4">
            {name}
        </button>
    )
}