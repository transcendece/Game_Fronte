"use client";

import React, { useCallback, useContext, useEffect, useState } from 'react';
import GameBot from "./GameBot";
import RealTimeGame from "./RealTimeGame";
import { WebsocketContext } from '../../Contexts/WebSocketContext';
import FriendButtons from './FriendButtons';
import { GameDependency } from '../../game/game.dto';
import RandomButtons from './RandomButtons';
import { Socket } from 'socket.io-client';

const GameButtons = () => {
    
    const socket :Socket = useContext(WebsocketContext);
    const [clientId, setClientId] = useState<string>('');
    const [gameId, setGameId] = useState<string>('');
    const [gameDependency, setGameDependency] = useState<GameDependency>();

    const [showBotGame, setShowBotGame] = useState(false)
    const [showRandomGame, setShowRandomGame] = useState(false)
    const [showfriendModal, setShowFriendModal] = useState(false)

	const handleConnection = useCallback(() =>{
		console.log("pong client connect!")
        console.log("CLIENT: ", socket.id);
	}, []);

	const handleCreateEvent = useCallback((res : {gameId: string}) => {
		setGameId(res.gameId);
	}, [])

	const handlePlayEvent = useCallback((res: {gameId: string, gameDependency :GameDependency}) => {
		setGameId(res.gameId);
		setGameDependency(res.gameDependency);
		setShowRandomGame(true);
	  }, []);

	useEffect(()=>{
        if (socket){
        	socket.connect();
            socket.on("connect", handleConnection)
            socket.on("CREATE", handleCreateEvent);
            socket.on("PLAY", handlePlayEvent);
			
            return ()=>{
				socket.off("connect", handleConnection);
				socket.off("CREATE", handleCreateEvent);
				socket.off("PLAY", handlePlayEvent);
            }
          }
        }, [socket])
    

    
    const handlePlayWithBot = () => {
      console.log('Playing with Bot');
      setShowBotGame(true);
    };
      
    return (
        <div className='flex justify-center items-center h-full flex-col '>
        {!showBotGame && !showRandomGame && ( 
          <>
                <button className='w-[200px] h-[50px] bg-black text-[white] cursor-pointer text-base m-2.5 px-5 py-2.5 rounded-[5px] border-[none] hover:bg-[#AF6915]' onClick={handlePlayWithBot}>Play with Bo9a</button>
                <RandomButtons />
                <FriendButtons socket={socket} clientId={clientId}></FriendButtons>
            </>
    	)}
        {showBotGame && <GameBot/>}
        {(showRandomGame && gameDependency) && <RealTimeGame gameId={gameId} gameDependency={gameDependency}/>}
    </div>
  );
};

export default GameButtons;
