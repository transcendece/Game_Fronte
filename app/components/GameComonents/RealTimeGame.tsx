"use client"

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import Matter, {
  Engine,
  Render,
  Bodies,
  Composite,
  Runner,
  Body,
  Vector,
  World,
} from "matter-js";
import { GameDependency } from "../../game/game.dto";
import { useRouter } from "next/navigation";
import { WebsocketContext } from "@/app/Contexts/WebSocketContext";
import router from "next/router";
import Score from "./scoreComponent";
import GameClass from "./GameClass";

interface RealTimeGameProps  {

  gameId: string;
};

interface Update{
	ball	:Vector
	p1		:Vector
	p2		:Vector
	ID		:number
	score1	:number
	score2	:number
}

let game: GameClass | null = null;


const RealTimeGame: React.FC<RealTimeGameProps> = ({ gameId}) => {
  // You can now use the socket object here

	const gameDiv = useRef<HTMLDivElement>(null);
	const [objectsInitialized, setObjectsInitialized] = useState(false);
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});
	const socket :Socket = useContext(WebsocketContext);
	console.log("RealTime component: clientid : ", socket.id);
		
	const handleStart = useCallback((res: Update) =>{
		console.log("HELLOZZZ ", res.ID);
		game?.startOnligneGame(res.p1, res.p2, res.ball, res.ID);
		game?.updateScore(res.score1, res.score2);			
	}, [])
		
	const handleGameOver = useCallback(() =>{
		console.log("GAMEEEEEOVER");		
		game?.GameFinish("GAMEOVER");
	}, [])
	const handleWinLose = useCallback(() =>{
			game?.GameFinish("WinOrLose");
	}, [])


	const handleWait = useCallback((res: {mod: string}) =>{
			console.log("WAIT");
			
	}, [])
	
	const handleUpdate = useCallback((res: Update) =>{
		// console.log("UPDATE REAL");
		game?.updateState(res.p1, res.p2, res.ball);
		game?.updateScore(res.score1, res.score2);
		
	}, [])
		
		
	
	useEffect(() => {
		if (socket)
		{	
		socket.on("START", handleStart)
		socket.on("UPDATE", handleUpdate)
		socket.on("GAMEOVER", handleGameOver);
		socket.on("WinOrLose", handleWinLose);
		socket.on("ERROR", () => {
			console.log("ERROR REAL");
		})}
		if (gameDiv && gameDiv.current && !game)
			game = new GameClass(gameDiv.current, "BEGINNER", "RANDOM", gameId, socket);
		else if (gameDiv && gameDiv.current && game)
			game.updateOnLigneSizeGame(gameDiv.current)
		if (game){console.log(game.getSize());}
		// console.log("GAMEDIV: ", gameDiv);
		// console.log("GAMEc: ", gameDiv.current);
		
		return () => {
			if (game) {game.destroyGame ; game = null}
			socket.off("START", handleStart)
			socket.off("WAIT", handleWait)
			socket.off("UPDATE", handleUpdate)
			socket.off("GAMEOVER", handleGameOver);
			socket.off("WinOrLose", handleWinLose);
					
				}

	}, [])

	return ( 
		<div className="flex red w-full h-full flex-row justify-center">
                 <div className="flex flex-col w-[20%] h-[20%] items-center justify-end">
                 <Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="PLAYER1" score={0} />
                 </div>
                 <div ref={gameDiv} className="flex justify-center w-[60%] blue h-[60%]"></div>
            <div className="flex flex-col w-[20%] h-[20%] items-center justify-start">
                 <Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="playe2" score={0} />
            </div>
        </div>
		);
};

export default RealTimeGame;