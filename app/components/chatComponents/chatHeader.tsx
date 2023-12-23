import React, { useEffect, useState } from "react";
// import { socket } from "./socket";
import { socket } from "@/app/Contexts/socket";
import { useRouter } from "next/navigation";
import GameInviteModal from "@/app/chat/gameInvite.modal";


interface ChatHeaderProps {
  name: string;
}

const ChatHeader = ({ name }: ChatHeaderProps) => {

  const router = useRouter()
  const [ShowInvite, SetShowInvite] = useState(false);
  const [invite, SetInvite] = useState<[string, string]>();

  const handlePlayClick = (name : string) => {
    console.log("NEW PLAY: ", name);
    //SEND THE ID OF CLIENT WITH INVIT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    socket.emit("INVITE", "98783")
  }

  const redirectToGame = () => {
    setTimeout(()=>{

      router.push('/game');
    }, 500)
  }
  const popEnvite = async (res: {recieverId: string, senderId: string}) => {
    console.log("IVITE recieved: ", res);
    SetInvite([res.recieverId, res.senderId]);
    SetShowInvite(true)
  }

  useEffect (() => {
    /***
     * INVITE send by the first client,{
     * we send a GameInvite demande to second player
     *    if the second player accepte
     *        redirect to game
     *    else
     *      send to first client refuse
     * }when 2em client accepte the demande 
     */
    // if (!socket.hasListeners("INVITE")) {
    //   socket.on("INVITE", redirectToGame);
    // }
    if (!socket.hasListeners("GameInvite")) {
      
      socket.on("GameInvite", popEnvite);
    }
    if (!socket.hasListeners("EnterGame")) {
      socket.on("EnterGame", redirectToGame)
    }
    if (!socket.hasListeners("ERROR",)) {
      socket.on("ERROR", (res : string)=> {console.log(res);
      })
    }

    return ()=>{
      //socket.off all l3aybat
      socket.off("GameInvite")
      socket.off("EnterGame")
      socket.off("ERROR")
      // socket.disconnect()
    }
   
}, [socket, ShowInvite, invite]); 
  

  return (
    <div className="border-b border-b-[#E58E27] bg-[#323232] rounded-t-lg h-20 w-full px-6 flex flex-row justify-between items-center">
      <div className="flex flex-row items-center justify-around space-x-1.5">
      {ShowInvite && invite && <GameInviteModal socket={socket} setGameInviteModal={SetShowInvite} reciever={invite[0]} sender={invite[1]}/>}
      <img src={"/noBadge.png"} alt="Your Image" className=" w-11 h-11 rounded-lg border"/>                                           
        <div className="flex flex-col">
          <p className="text-xs text-gray-600">{name}</p>
        </div>
          <button className="border rounded border-[#E58E27] p-1 hover:bg-[#E58E27]" onClick={ 
            () => {
              handlePlayClick(name)
            }
          }>Play</button>
      </div>
    </div>
  );
};

export default ChatHeader;