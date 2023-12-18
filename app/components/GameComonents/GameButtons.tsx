"use client";

import React, { useContext, useEffect, useRef, useState } from 'react';
import GameClass from "./GameClass";
import { WebsocketContext } from '../../Contexts/WebSocketContext';
import FriendButtons from './FriendButtons';
import { GameDependency } from '../../game/game.dto';
import RandomButtons from './RandomButtons';
import { Socket } from 'socket.io-client';
import BotButtons from './BotButtons';
import BotComponent from './botComponent';
import Loadig from './LoadingComponent';
import Score from './scoreComponent';
import { Vector } from 'matter-js';

interface Update{
	ball	:Vector
	p1		:Vector
	p2		:Vector
	ID		:number
	score1	:number
	score2	:number
}

let game: GameClass | null = null;

const GameButtons = () => {
    
    const socket :Socket = useContext(WebsocketContext);
	const gameDiv = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<string>('');
    const [wait, setWait] = useState<boolean>(false);
	const [waitmsg, setWaitMsg] = useState<string>('WAITTTTT')
    const [gameId, setGameId] = useState('');
    const [showBotGame, setShowBotGame] = useState(false)
    const [showRandomGame, setShowRandomGame] = useState(false)



	// const handleCreate = useCallback((res : {gameId: string}) => {
	// 	console.log()
	// 	setGameId(res.gameId);
	// }, [])

	useEffect(() => 
	console.log("-> gameid : ", gameId), [gameId])

	const handlePlay = async (res: {gameId: string} & Update) => {
		console.log("START");
		console.log("gameid : ", res.gameId);
		setWait(false);
		setShowRandomGame(true);
		console.log({ bdiv: gameDiv.current })
		// await new Promise(res => setTimeout(res, 1000));
		console.log({ adiv: gameDiv.current })
		setGameId(res.gameId);
		game = new GameClass(gameDiv.current!, "BEGINNER", "RANDOM", gameId, socket);
		console.log("==> GAMEID CREATED: ", game.Id)
		game.startOnligneGame(res.p1, res.p2, res.ball, res.ID);
		game.updateScore(res.score1, res.score2);
	};

	function removeGame() {
		setShowRandomGame(false);
		game?.destroyGame();
		game = null;
	}

	
	useEffect(()=>{
		socket.on("START", handlePlay);
		// socket.on("START", handleStart);
		
		// socket.on("CREATE", handleCreate);
		socket.on("UPDATE", (res : Update)=>{
			game?.updateState(res.p1, res.p2, res.ball);
			game?.updateScore(res.score1, res.score2);
		});
		socket.on("WinOrLose", () => {
			console.log("WINORLOSE");
			removeGame();
		} )
		
		socket.on("GAMEOVER", ()=>{
			console.log("GAMEOVER");
			removeGame();
			
		} )

		socket.on("WAIT", ()=>{
			setWait(true);

		})

		socket.on("ERROR", () => {
			console.log("ERROR BUTT");
		})

		/**
		 * events: ERROR, GAMEOVER, CREATE, WAIT, UPDATE, PLAY
		*/
		return ()=>{
			console.log('remove game listeners')
			socket.off("connect");
			socket.off("CREATE");
			socket.off("PLAY")
			socket.off("START");
            socket.off("UPDATE");
			socket.off("WAIT")
			socket.off("GAMEOVER");
			socket.off("WinOrLose");
			socket.off("ERROR")
			console.log(showRandomGame, "usestate");
			
        }
    } , [gameId]);

	useEffect(() => {
		return () => {
			console.log('remove game')
			removeGame();
		}
	}, [])

      
    return (
		<div className='flex justify-center items-center w-full h-full flex-col '>
			{!showRandomGame && !showBotGame && !wait && ( 
			<>
					<BotButtons setShowBotGame={setShowBotGame} setModBot={setMap}/>
					<RandomButtons setMap={setMap} />
					<FriendButtons></FriendButtons>
			</>
			)}
			{(showBotGame ) && <BotComponent map={map}></BotComponent>}
			{/* {(showRandomGame) && <RealTimeGame gameId={gameId}/>} */}
			{showRandomGame  && (
				<>
					<Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="PLAYER1" score={0}></Score>
					<div ref={gameDiv} className="flex justify-center w-[60%] blue h-[60%]"></div>
					<Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="PLAYER1" score={2}></Score>
				</>
			)}
			{(wait) && <Loadig msg={waitmsg}></Loadig>}
		</div>
  );
};

export default GameButtons;
