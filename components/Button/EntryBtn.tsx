type EntryBtnProps = {
    name: string,
    click?: any
}

export default function EntryBtn({name,click = () => console.log('no action')} : EntryBtnProps) {
    return (
        <button onClick={click} className="entryBtn bg-bgPrimary hover:bg-[#2d2d2dbb] transition-all duration-150 text-2xl w-full text-center flex justify-center items-center sulphur text-[#fff] rounded-[6px] py-2">
            {name}
        </button>
    )
}