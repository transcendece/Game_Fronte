'use client'
import React, { useEffect } from 'react'
import { useState } from 'react';
import { RiSendPlane2Fill } from "react-icons/ri";
import { socket } from './socket';
import { io } from 'socket.io-client';
import { Conversation } from '@/app/Slices/chatSlice';
import axios from 'axios';

export interface chatInputProps {
  onSendMessage: (message: string) => void;
  conversation: Conversation;
}

function ChatInput({onSendMessage, conversation}: chatInputProps) {
  const [message, setMessage] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('SendMessage', {
        "content" : message,
        "senderId" : conversation?.owner,
        "recieverId" : conversation?.username,
      });
      onSendMessage(message);
      setMessage('');
      
    }
  };

  return (
    <div className='w-full h-[74px] flex justify-center bg-[#323232] rounded-b-lg items-center border-t border-t-[#E58E27]'>
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        placeholder="Send a message ..."
        className="w-[85%] medium:w-[90%] h-[60%] bg-[#131313] text-slate-400 p-2 border-2 rounded-full outline-none border-[#ababab] focus:border focus:border-[#E58E27]"
      />
      <button
        onClick={handleSendMessage}
        className="ml-2 px-4 h-[50%] py-2 bg-[#E58E27] text-white rounded cursor-pointer"
      > <RiSendPlane2Fill />
      </button>
    </div>
  )
}

export default ChatInput