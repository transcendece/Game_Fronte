"use client";

import React, { useContext, useEffect, useRef, useState } from 'react';
import GameClass from "./GameClass";
import { WebsocketContext } from '../../Contexts/WebSocketContext';
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
	const [dep1, setDep1] = useState<[string, string]>(["", ""])
	const [dep2, setDep2] = useState<[string, string]>(["", ""])
	const [score, setScore] = useState<[number, number]>([0, 0])
	const [Id, setId] = useState<number>(0)

	const handlePlay = async (res: {gameId: string} & Update & {avatar: [string, string], names: [string, string]}) => {
		console.log("START");
		setDep1([res.avatar[0], res.names[0]])
		setDep2([res.avatar[1], res.names[1]])
		setId(res.ID);
		console.log("dep: ", res.avatar, res.names);
		
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
			setScore([res.score1, res.score2])
			console.log({ showRandomGame })
		}, 200)
	};
	
	function removeGame() {
		setShowRandomGame(false);
		game?.destroyGame();
		game = null;
	}
	
	useEffect(()=>{console.log("MAP IN: ", map);
	}, [map])

	useEffect(()=>{
		console.log("ID: ", socket.id);
		socket.on("START", handlePlay);
		
		socket.on("UPDATE", (res : Update)=> {
			game?.updateState(res.p1, res.p2, res.ball);
			// console.log("res: ", res);
			setScore([res.score1, res.score2])
			
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

		socket.on("ERROR", (res: string) => {
			console.log("ERROR BUTT", res);
		})

		socket.on("REDIRECT", (url: string) => {
			window.location.href = url;
			console.log("URL : url");
			
		})
		
		/**
		 * events: ERROR, GAMEOVER, CREATE, WAIT, UPDATE, PLAY
		*/
		return ()=>{
			console.log('remove game listeners')
			socket.off("REDIRECT")
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
    } , [map, dep1]);

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
					<BotButtons setShowBotGame={setShowBotGame} setMap={setMap}/>
					<RandomButtons setMap={setMap} />
			</>
			)}
			{(showBotGame ) && <BotComponent map={map} setBotGame={setShowBotGame}></BotComponent>}
			{(
				<>
					{
						showRandomGame && (Id === 1 ? <Score avatar={dep2[0]} name={dep2[1]} score={score[1]}></Score> 
						: <Score avatar={dep1[0]} name={dep1[1]} score={score[0]}></Score>)
					}
					<div ref={gameDiv} className={`flex justify-center w-[60%] h-[60%] ${!showRandomGame ? 'hidden' : ''}`}></div>
					{
						showRandomGame && (Id === 1 ? <Score avatar={dep1[0]} name={dep1[1]} score={score[0]}></Score> 
						: <Score avatar={dep2[0]} name={dep2[1]} score={score[1]}></Score>) 
					}
				</>
			)}
			{(wait) && <Loadig msg={waitmsg}></Loadig>}
		</div>
  );
};

export default GameButtons;
