"use client"
import React, { useEffect, useRef, useState } from 'react';
import GameBot from './GameBot';
import Score from './scoreComponent';

interface BotMap{
    map: string
}

let game: GameBot | null = null;

const BotComponent : React.FC<BotMap> = (prop) => {
    const gameDiv = useRef<HTMLDivElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(0)
    const [width, setWidth] = useState<number>(0)

    const handleResize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };


    // useEffect(() => {
    //     handleResize();
    //     if (typeof window !== "undefined") {
    //       window.addEventListener("resize", handleResize);
    //       return () => {
    //         window.removeEventListener("resize", handleResize);
    //       };
    //     }
    // }, []);

    useEffect(() => {
        if (gameDiv && gameDiv.current)
            { game = new GameBot(gameDiv.current, prop.map, "BOT"); console.log("GAMECLASS"); }
        console.log("offs: ", gameDiv.current?.offsetTop);
        
        return () => {
            if (game)
                game.destroyGame();
        }
    }, [width, height]);

    return (
        <div ref={divRef} className="flex red w-full flex-row h-full justify-evenly">
                 <div className="flex flex-col items-center justify-end">
                 <Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="PLAYER1" score={0} />
                 </div>
                 <div ref={gameDiv} className="flex justify-center w-full blue h-full"></div>
            <div className="flex flex-col items-center justify-start">
                 <Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="BO9A" score={0} />
            </div>
        </div>
    );
};

export default BotComponent