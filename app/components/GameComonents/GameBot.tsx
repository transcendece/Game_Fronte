"use client"

import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Engine, Render, Bodies, Composite, Runner, Body} from 'matter-js';
import Matter from "matter-js";
import 'tailwindcss/tailwind.css';
import Score from "./scoreComponent";

let engine = Engine.create();
let width = 600;
let height = 800;
let paddleWidth = 125;
let paddleHeight = 20;
const AdvancedObs            :Body[] = [Bodies.rectangle(width / 2, height / 2, width / 2, 10, { isStatic: true, chamfer: { radius: 10} , label: "ADV"})]
const IntemidierObs            :Body[] = [Bodies.rectangle(width / 2, height / 2, 400, 10, { isStatic: true , label: "INTE"})]
// let score1 = 0
// let score2 = 0


function GameBot(){
    const gameDiv = useRef<HTMLDivElement>();
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const aspectRatio = width / height;
    let mode = "ADV";

    function initGame(){

    }
    const divRef = useRef<HTMLDivElement>(null);
    const [divSize, setDivSize] = useState({ width: 0, height: 0 });

    // useEffect(() => {
        //     console.log("USE Div Size: ", divSize);
        
        //    }, [divSize]);
        
        useEffect(() => {
            if (divRef.current) {
                setDivSize({
                    width: divRef.current.offsetWidth,
                    height: divRef.current.offsetHeight,
                });
                console.log("Div Size: ", divSize);
                console.log("devref: ", divRef.current.offsetWidth, divRef.current.offsetHeight);
                
            }
        }, [divSize]);

    useEffect(() => {
        if (divRef.current){
            const newWidth = divRef.current.offsetWidth * 0.6;
            const newHeight = newWidth / aspectRatio;


            engine = Engine.create({
                gravity: {x: 0, y: 0, scale: 0},
                positionIterations: 10,
                velocityIterations: 8,
            });
            
            
            //Create the renderer
            let render = Render.create({
                element: gameDiv.current || document.body,
                engine: engine,
                options:{
                    background: '#000000',
                    width: newWidth,
                    height: newHeight,
                    wireframes: false,
                }
            });;
            
            let wallOptions = {
                isStatic: true,
                render: {
                    fillStyle: '#FFF',
                    strokeStyle: '#000',
                    lineWidth: 1,
                },
            };
            

            var topground =  Bodies.rectangle(0 , 0, render.options.width as number, 10, wallOptions);
            var downground =  Bodies.rectangle(0, 800, 1200, 10, wallOptions);
            var leftground =  Bodies.rectangle(0, 0, 10, 1600, wallOptions);
            var rightground =  Bodies.rectangle(600, 0, 10, 1600, wallOptions);
            let bounds = Composite.create()
            Composite.add(bounds, [topground, leftground, downground, rightground])
            if (mode === "ADV")
                Composite.add(bounds, [...AdvancedObs])

            var ball = Bodies.circle(width / 2, height / 2, 10, { 
                restitution: 1,
                frictionAir: 0,
                friction:0,
                inertia: Infinity,
                render:{
                    fillStyle: "red"
                }
            });
            Matter.Body.setVelocity(ball, {
                x: 5,
                y: 5,
            })

            var player1 = Bodies.rectangle(width / 2, 20, paddleWidth, paddleHeight, {
                isStatic: true,
                chamfer: { radius: 10},
                render:{
                    fillStyle: "purple"
                },
            });
            
            var player2 = Bodies.rectangle(width / 2, 780, paddleWidth, paddleHeight, { 
                isStatic: true,
                chamfer: { radius: 10},
                render:{
                    fillStyle: "blue"
                }
            });
            
            const maxVelocity = 20;
            

            Matter.Events.on(engine, "collisionStart", (event) =>{
                event.pairs.forEach((pair)=>{
                    const bodyA = pair.bodyA;
                    const bodyB = pair.bodyB;
                    
                    
                    if (bodyA === ball || bodyB == ball){
                            const normal = pair.collision.normal;
                            const Threshold = 0.1;
                            if (Math.abs(normal.x) < Threshold){
                                const sign = Math.sign(ball.velocity.x);
                                const i = 0.5;
                                Body.setVelocity(ball, {
                                    x: Math.min(ball.velocity.x + sign * i , maxVelocity),
                                    y : ball.velocity.y
                                })
                                const restitution = 1; // Adjust this value for desired bounciness
                                const friction = 0; // Adjust this value for desired friction
                                
                                // Set restitution and friction for the ball
                                Body.set(ball, { restitution, friction });
                                
                                // Set restitution and friction for the other body (if it's not static)
                                const otherBody = bodyA === ball ? bodyB : bodyA;
                                if (!otherBody.isStatic) {
                                    Body.set(otherBody, { restitution, friction });
                                }
                                if (otherBody === topground || otherBody === downground){
                                    if (otherBody === topground) setScore1((prevScore) => prevScore + 1);
                                    else setScore2((prevScore) => prevScore + 1);
                                    Body.setPosition(ball, { x: 300, y: 400 });
                                    Body.setVelocity(ball, { x: 5, y: -5 });
                                }
                                
                            }
                        }

                    });
                }); 
                
                Composite.add(engine.world, bounds);
                Composite.add(engine.world, [ball, player1, player2]);
                // // run the renderer
                Render.run(render);
                Runner.run(Runner.create(), engine);
                
                
                gameDiv.current!.addEventListener('mousemove', (event: MouseEvent) => {
                    let mouseX = event.clientX - gameDiv.current!.offsetLeft;
                    let mouseY = event.clientY - gameDiv.current!.offsetTop;
                    // calculate new position for paddleA
                    // let newPosition = { x: mouseX, y: player2.position.y };
                    if (render.options && render.options.width){
                        const paddleX = Math.min(Math.max(mouseX - paddleWidth / 2, paddleWidth / 2), render.options.width - paddleWidth / 2)
                        // console.log(`x : ${paddleX} && mouseX: ${mouseX} && y : ${player2.position.y}`);
                        Body.setPosition(player2, {x: paddleX, y:player2.position.y})
                    }
                    
                });
                Matter.Events.on(engine, "beforeUpdate", () => {
                    Body.setPosition(player1,  {x: ball.position.x, y:player1.position.y})
                });

                
                return () =>{
                    // window.removeEventListener('resize', handleResize);
                    render.canvas.remove();
                }
        }
    }, [divSize]);
        
        
    return (
        <div ref={divRef} className="flex w-full flex-row h-full justify-evenly">
            <div className="flex flex-col items-center justify-end">
            <Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="PLAYER1" score={score1} />
            </div>
            <div ref={gameDiv} className="w-auto red h-full"></div>
            <div className="flex flex-col items-center justify-start">
            <Score avatar="/_next/image?url=%2Fbatman.png&w=3840&q=75" name="BO9A" score={score2} />
            </div>
        </div>
      );
}


export default GameBot;



