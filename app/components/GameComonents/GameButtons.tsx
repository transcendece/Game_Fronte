"use client";

import React, { useCallback, useContext, useEffect, useState } from 'react';
import GameBot from "./GameBot";
import RealTimeGame from "./RealTimeGame";
import { WebsocketContext } from '../../Contexts/WebSocketContext';
import FriendButtons from './FriendButtons';
import { GameDependency } from '../../game/game.dto';
import RandomButtons from './RandomButtons';
import { Socket } from 'socket.io-client';
import BotButtons from './BotButtons';
import BotComponent from './botComponent';

const GameButtons = () => {
    
    const socket :Socket = useContext(WebsocketContext);
    const [BotMap, setBotMap] = useState<string>('');
    const [gameId, setGameId] = useState<string>('');
    const [gameDependency, setGameDependency] = useState<GameDependency>();
    const [showBotGame, setShowBotGame] = useState(false)
    const [showRandomGame, setShowRandomGame] = useState(false)

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
    


      
    return (
        <div className='flex justify-center items-center h-full flex-col '>
        {!showRandomGame && !showBotGame && ( 
          <>
                <BotButtons setShowBotGame={setShowBotGame} setModBot={setBotMap}/>
                <RandomButtons />
                <FriendButtons></FriendButtons>
            </>
    	)}
		{(showBotGame ) && <BotComponent map={BotMap}></BotComponent>}
        {(showRandomGame && gameDependency) && <RealTimeGame gameId={gameId} gameDependency={gameDependency}/>}
    </div>
  );
};

export default GameButtons;
