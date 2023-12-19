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
    const [map, setMap] = useState<string>('BEGINNER');
    const [wait, setWait] = useState<boolean>(false);
	const [waitmsg, setWaitMsg] = useState<string>('WAITTTTT')
    const [showBotGame, setShowBotGame] = useState(false)
    const [showRandomGame, setShowRandomGame] = useState(false)

	const handlePlay = async (res: {gameId: string} & Update) => {
		console.log("START");
		console.log("gameid : ", res.gameId);
		setWait(false);
		setShowRandomGame(true);
		setTimeout(() => {
			console.log({ adiv: gameDiv.current })
			console.log("MAAAAAAP:::: ", map);
			
			game = new GameClass(gameDiv.current!, map, "RANDOM", res.gameId, socket);
			console.log("==> GAMEID CREATED: ", game.Id)
			game.startOnligneGame(res.p1, res.p2, res.ball, res.ID);
			game.updateScore(res.score1, res.score2);
			console.log({ showRandomGame })
		}, 200)
	};
	
	function removeGame() {
		setShowRandomGame(false);
		game?.destroyGame();
		game = null;
	}

	useEffect(()=>{console.log("MAP IN USEZEEBBBBBI: ", map);
	}, [map])
	
	useEffect(()=>{
		socket.on("START", handlePlay);
		// socket.on("START", handleStart);
		
		// socket.on("CREATE", handleCreate);
		socket.on("UPDATE", (res : Update)=> {
			// if (!game) {
			// 	console.log({ adiv: gameDiv.current })
			// 	game = new GameClass(gameDiv.current!, "BEGINNER", "RANDOM", res.gameId, socket);
			// 	console.log("==> GAMEID CREATED: ", game.Id)
			// 	game.startOnligneGame(res.p1, res.p2, res.ball, res.ID);
			// 	game.updateScore(res.score1, res.score2);
			// 	console.log({ showRandomGame })
			// }
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
    } , []);

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
			</>
			)}
			{(showBotGame ) && <BotComponent map={map} setBotGame={setShowBotGame}></BotComponent>}
			{(
				<>
					{showRandomGame && <Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="PLAYER1" score={0}></Score>}
					<div ref={gameDiv} className={`flex justify-center w-[60%] h-[60%] ${!showRandomGame ? 'hidden' : ''}`}></div>
					{showRandomGame && <Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="PLAYER1" score={2}></Score>}
				</>
			)}
			{(wait) && <Loadig msg={waitmsg}></Loadig>}
		</div>
  );
};

export default GameButtons;
