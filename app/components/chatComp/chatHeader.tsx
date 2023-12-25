import React from "react";
import { MdVideogameAsset } from "react-icons/md";


interface ChatHeaderProps {
  name: string;
}

const ChatHeader = ({ name }: ChatHeaderProps) => {
  return (
    <div className="border-b border-b-[#E58E27] bg-[#323232] rounded-t-lg h-20 w-full px-6 flex flex-row justify-between items-center">
      <div className="flex flex-row w-full items-center space-x-1.5">
        <div className="w-5/6 flex items-center">
          <img src={"/noBadge.png"} alt="Your Image" className=" w-11 h-11 rounded-lg border flex"/>                                           
          <div className="flex flex-col p-2">
            <p className="text-xs text-gray-600 p-2">{name}</p>
          </div>
        </div>
        <button className="w-32 flex rounded-lg px-3 py-1 bg-[#E58E27] text-sm">
          <h1 className="m-auto w-full text-center">Invite</h1>
          <h1 className="text-2xl text-[#E58E27] bg-white px-1 rounded-lg m-auto"><MdVideogameAsset /></h1>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;