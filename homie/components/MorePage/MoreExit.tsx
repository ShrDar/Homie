
import { useState, useEffect } from "react";
import LogOutModal from "../Portals/LogOutModal";
import { motion } from "framer-motion";
import { IoLogOut } from "react-icons/io5";

export default function MoreExit() {
  const [isDefaultMode, setIsDefaultMode] = useState(true);
  const [openLogOutModal, setOpenLogOutModal] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 h-full flex flex-col gap-6">
      <h2 className={`text-xl lg:text-2xl text-center font-semibold ${isDefaultMode ? 'text-fontPrimary' : 'text-gray-800'}`}>
        Exit
      </h2>
      
      <div className="flex flex-col gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpenLogOutModal(true)}
          className={`w-full p-4 rounded-lg cursor-pointer ${
            isDefaultMode ? 'bg-bgPrimary hover:bg-[#3a3a3a]' : 'bg-gray-100 hover:bg-gray-200'
          } transition-all`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${
              isDefaultMode ? 'bg-bgSecondary' : 'bg-white'
            } flex items-center justify-center`}>
              <IoLogOut className={`w-5 h-5 ${isDefaultMode ? 'text-fontPrimary' : 'text-gray-800'}`} />
            </div>
            <div>
              <p className={`font-medium ${isDefaultMode ? 'text-fontPrimary' : 'text-gray-800'}`}>Logout</p>
              <p className={`text-sm ${isDefaultMode ? 'text-gray-400' : 'text-gray-600'}`}>Yeet out</p>
            </div>
          </div>
        </motion.div>
      </div>

      {openLogOutModal &&
        <LogOutModal setOpenLogOutModal={setOpenLogOutModal} />
      }
    </div>
  );
}