
export default function MoreShortcuts() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 h-full flex flex-col gap-3">
      <h2 className="text-2xl font-semibold text-fontPrimary">Keyboard Shortcuts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sign Out Shortcut */}
        <div className="bg-bgSecondary rounded-lg p-4 flex flex-col items-center justify-center gap-4 hover:bg-opacity-80 transition-all duration-200">
          <div className="flex items-center gap-2">
            <kbd className="px-4 py-2 text-lg font-semibold text-fontPrimary bg-bgPrimary border-2 border-[#666666] rounded-lg">
              Ctrl
            </kbd>
            <span className="text-fontPrimary text-xl">+</span>
            <kbd className="px-4 py-2 text-lg font-semibold text-fontPrimary bg-bgPrimary border-2 border-[#666666] rounded-lg">
              Q
            </kbd>
          </div>
          <span className="text-[#AAAAAA] text-sm">Sign Out</span>
        </div>        
      </div>
    </div>
  );
}