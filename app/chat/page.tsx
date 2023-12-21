'use client'
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar"
import ChatHeader from "@/app/components/chatComp/chatHeader"
import ChatContent from "../components/chatComp/chatContent";
import ChatInput from "../components/chatComp/chatInput";
import ConversComp from "../components/chatComp/conversComp";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { messages } from "../components/chatComp/messages";
import { socket } from "../components/chatComp/socket";
import { BiConversation } from "react-icons/bi";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { PropagateLoader } from "react-spinners";
import { RiChatNewFill } from "react-icons/ri";
import { MdVideogameAsset } from "react-icons/md";


import axios from "axios";
import Link from "next/link";

export interface Message {
  avatar: string,
  content: string;
  sender: string;
  isOwner: boolean;
  conversationId? : string;
}

export interface Conversation {
  id: number;
  online: boolean;
  username: string;
  avatar: string;
  owner:string;
  timestamp?: number;
  messages: Message[];
  conversationId? : string;
}

export default function chat() {

  const conversations: Conversation[] = useSelector((state: RootState) => state.chat?.entity);
  const loading: boolean = useSelector((state: RootState) => state.chat?.loading);
  const error: string | null = useSelector((state: RootState) => state.chat?.error);
  const [selectedConv, setSelectedConv] = useState<Conversation[]>(conversations);
  const [showConversations, setShowConversations] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [selectConvId, setSelectConvId] = useState<number>(0);
  const [isNewChat, setIsNewChat] = useState<Boolean>(false);

  useEffect(() => {
    setSelectedConv(conversations)
  }, [conversations])

  useEffect(() => {
    socket.on('RecieveMessage', (data: Message) => {
      
      if (data.conversationId) {
        const timestamp = Date.now();
        
        const existingConversation: Conversation | undefined = selectedConv.find(
          (conversation) => conversation.username === data.sender
          );
          console.log(data.conversationId);
          console.log(existingConversation);
          
          console.log('got event ==> ', existingConversation);

          if (existingConversation ) {
            setSelectedConv((prevConversations) =>
            prevConversations.map((conversation) =>
            conversation.id === existingConversation.id
            ? {
              ...existingConversation,
              timestamp,
              messages: [...existingConversation.messages, data],
            }
            : conversation
            )
            );
          }
        }
    });
  
    return () => {
      socket.off('RecieveMessage');
    };
  }, [selectedConv]); 
  
  // const [allMessages, setAllMessages] = useState<Message[]>(selectedConv[0].messages);

  
  
  // console.log(allMessages);
  const handleSendMessage = (newMessage: string) => {
    if (selectConvId !== null) {
      const timestamp = Date.now();
      const updatedConversations = selectedConv.map((conversation: any) =>
        conversation.id === selectConvId
          ? {
              ...conversation,
              timestamp: timestamp,
              messages: [
                ...conversation.messages,
                {
                  avatar: conversation.avatar,
                  content: newMessage,
                  sender: conversation.owner,
                  isOwner: true,
                },
              ],
            }
          : conversation
      );

      setSelectedConv(updatedConversations);
      
    // const newChatMessage: Message = {
    //   avatar:"",
    //   text: newMessage,
    //   sentBy: 'owner',
    //   isChatOwner: true,
    // };
    // setAllMessages((prevMessages) => [...prevMessages, newChatMessage]);
    }
  }

  const handleNewChat = () => {
    setIsNewChat(true);
  }

  const onCloseClick = () => {
    setIsNewChat(false);
  }

  
  if (loading || error){
    return (
      <div className="text-white flex flex-col justify-center items-center w-full h-[70%] xMedium:h-screen">
        <div className="m-auto flex flex-col justify-center text-xl h-[30%]">
          <div className="absolute top-[45%] left-[42%] medium:left-[45%]">  LOADING . . .</div>
          <div className="absolute top-[50%] left-[48%]"><PropagateLoader color={"#E58E27"} loading={loading} size={20} aria-label="Loading Spinner"/></div>
        </div>
      </div>
    )
  }
    
    const sortedConversations = (selectedConv && Array.isArray(selectedConv)) ? selectedConv?.slice().sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return timestampB - timestampA;
    }) : [];


  return (
          <div className="flex flex-col justify-between items-center h-screen min-h-screen min-w-screen">
            <div className="h-16 w-full Large:h-24"><Navbar pageName="chat"/></div>
            <div className="h-[80%] min-h-[600px] medium:min-h-[700px] m-auto w-[410px] medium:w-[90%] mt-11">
              <div className="w-full h-[90%] xMedium:h-full flex xMedium:flex xMedium:justify-between xMedium:items-center ">
                <div id="id_1" className={`${showConversations ? 'flex' : 'hidden'} h-full w-full xMedium:flex flex-col bg-[#131313] border-2 border-[#323232] xMedium:w-[33%] rounded-xl`}>
                  <div className="flex h-20 bg-[#323232] p-6 m-auto w-full border-b rounded-t-lg border-b-[#E58E27]">
                    <h1 className="w-[60%] h-full">INBOX</h1>
                    <div className="w-[40%] h-full flex justify-between space-x-4">
                      <button onClick={handleNewChat} className="w-[25%] rounded-lg h-full text-2xl p-1 bg-[#E58E27] "><RiChatNewFill /></button>
                      <button className="w-[75%] rounded-lg px-3 py-1 bg-[#E58E27] text-sm">
                        <h1 className="m-auto">New game</h1>
                      </button>
                    </div>
                  </div>
                  <div className=" h-full w-full overflow-y-auto scrollbar-hide rounded-b-xl xMedium:rounded-xl">
                      {sortedConversations.map((conversation: Conversation) => (
                        <div key={conversation.id} className="h-20 w-full xMedium:bg-opacity-20 xMedium:bg-white shadow-sm xMedium:shadow-white">
                          <button
                          
                          onClick={() => {setSelectConvId(conversation.id); setShowConversations(false);}}
                          className="xMedium:w-full xMedium:h-full xMedium:bg-white xMedium:bg-opacity-10 transition duration-500 ease-in-out hover:text-orange-500 hover:bg-opacity-100"
                          ><ConversComp conversation={conversation}/>
                          </button>
                        </div>
                      ))}

                  </div>
                </div>
                { (<div id="id_2" className={`${showConversations ? 'hidden' : 'flex'} flex-col xMedium:block w-full h-full xMedium:w-[65%] bg-[#131313] border-2 border-[#323232] rounded-xl`}>
                  <ChatHeader name="Nems"/>
                  <ChatContent messages={selectedConv.find((conversation) => conversation.id === selectConvId)?.messages || []}/>
                  <ChatInput onSendMessage={handleSendMessage} conversation={sortedConversations.find((conversation) => conversation.id === selectConvId) as Conversation}/>
                </div>)}
              </div>
              <div className="xMedium:hidden mt-4 w-full flex shadow-sm border border-[#323232] rounded-xl shadow-[#E58E27] ">
                <button onClick={() => setShowConversations(true)} className={`w-1/2 py-2 ${showConversations ? 'bg-[#131313] text-[#E58E27]' : 'hover:bg-[#cacaca] hover:bg-opacity-10 text-[#E58E27]'} text-3xl  transition duration-500 flex ease-in-out rounded-l-xl border-r border-[#323232]`}><span className="text-center m-auto"><BiConversation /></span>
                    </button>
                <button onClick={() => setShowConversations(false)} className={`w-1/2 py-2 ${!showConversations ? 'bg-[#131313] text-[#E58E27]' : 'hover:bg-[#cacaca] hover:bg-opacity-10 text-[#E58E27]'} text-3xl  transition duration-500 flex ease-in-out rounded-r-xl border-l border-[#323232]`}><span className="text-center m-auto"><BiSolidMessageSquareEdit /></span>
                    </button>
              </div>
              {/* Pop-up */}
              <div id="timeline-modal"  aria-hidden="true" className={`${!isNewChat ? "hidden" : ""} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
                      <div className="top-[25%] left-[10%] medium:left-[35%] relative p-4 w-full max-w-md max-h-full">
                      <div className="relative bg-[#131313] bg-opacity-60 text-white rounded-lg shadow-[#E58E27] shadow-md border-2 border-[#323232]">
                                  <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                                      <h3 className="text-lg font-semibold text-slate-100">
                                          Send new message
                                      </h3>
                                      <button onClick={onCloseClick} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="timeline-modal">
                                          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                              <path stroke="currentColor" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                          </svg>
                                          <span className="sr-only">Close modal</span>
                                      </button>
                                  </div>
                                  <div className="p-4 md:p-5">
                                      <div className="relative flex items-center flex-col gap-4 border-gray-200 ms-3.5 mb-4 md:mb-5">
                                          <label className="w-[82%] ">
                                            <h3>Send to </h3>
                                            <input className="w-full bg-[#323232] p-1 h-10 rounded-lg text-slate-100 focus:border focus:border-[#E58E27] outline-none" type="text" />                              
                                          </label>
                                          <label>
                                            <h3>Write your message :</h3>
                                            <textarea className="bg-[#323232] p-1 rounded-lg text-slate-100 focus:border focus:border-[#E58E27] outline-none" name="postContent" rows={4} cols={30} />
                                          </label>                           
                                      <button className="text-white items-center inline-flex w-[82%] justify-center bg-[#E58E27] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                        <Link href={'/2FaValidation'}> SEND </Link>
                                      </button>
                                      </div>
                                  </div>
                              </div>
                      </div>
                  </div> 
                  {/* pop-Up */}
            </div>
          </div>

  )
}