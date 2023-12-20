import React from "react";


interface ChatHeaderProps {
  name: string;
}

const ChatHeader = ({ name }: ChatHeaderProps) => {
  return (
    <div className="border-b border-b-[#E58E27] bg-[#323232] rounded-t-lg h-20 w-full px-6 flex flex-row justify-between items-center">
      <div className="flex flex-row items-center space-x-1.5">
      <img src={"/noBadge.png"} alt="Your Image" className=" w-11 h-11 rounded-lg border"/>                                           

        <div className="flex flex-col">
          <p className="text-xs text-gray-600">{name}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;