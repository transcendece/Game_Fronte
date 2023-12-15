"use client"

import React, { useRef, useEffect, useState, useLayoutEffect, useContext } from "react";
import { Engine, Render, Bodies, Composite, Runner, Body, Composites, Vector} from 'matter-js';
import Matter from "matter-js";
import 'tailwindcss/tailwind.css';
import Score from "./scoreComponent";
import { Socket } from "socket.io-client";
import { WebsocketContext } from "@/app/Contexts/WebSocketContext";



const globalWidth = 600;
const globalHeight = 800;
const aspectRatio = globalWidth / globalHeight;
const paddleWidth = 125;
const paddleHeight = 20;
let wallOptions = {
    isStatic: true,
    render: {
        fillStyle: '#FFF',
        strokeStyle: '#000',
        lineWidth: 1,
    },
};

function generateColor(map: string) : string{
    if (map === "ADVANCED")
        return '#000000'
    else if (map === 'INTEMIDIER')
        return '#1f1f1f'
    return '#222222'
}

class GameBot {
    engine: Engine = Engine.create({gravity: {x: 0, y: 0, scale: 0},});
    render: Render;
    runner: Runner = Runner.create();
    element :HTMLDivElement;
    ball: Body = Bodies.circle(0, 0, 0);
    p1: Body = Bodies.rectangle(0,0,0,0);
    p2: Body =Bodies.rectangle(0,0,0,0);;
    topWall: Body =Bodies.rectangle(0,0,0,0);;
    downWall: Body =Bodies.rectangle(0,0,0,0);;
    walls: Body[] = [
        Bodies.rectangle(0,0,0,0),
        Bodies.rectangle(0,0,0,0),
        Bodies.rectangle(0,0,0,0),
        Bodies.rectangle(0,0,0,0),
    ];
    obstacles: Body[] = [];
    width: number;
    height: number
    map:string;
    socket: Socket | null = null;
    mod: string;
    maxVelocity: number = 5;
    public score1: number = 0;
    public score2: number = 0;
    Id: number = 0;
    gameId: string;
    private boundHandleMouseMove: (event: MouseEvent) => void;

    constructor(element: HTMLDivElement, map: string, mod: string, gameId: string,socket?: Socket){
        // window.addEventListener('resize', this.calculateSise);
        if (socket)
            this.socket = socket
        this.boundHandleMouseMove = this.mouseEvents.bind(this);
        this.gameId = gameId;
        this.map = map;
        this.mod = mod;
        this.element = element;
        [this.width, this.height] = this.calculateSise();
        console.log("WIDTH: ", this.width, " HEIGHT: ", this.height);
        if (map === "ADVANCED") this.maxVelocity += 6;
        else if (map === "INTEMIDIER") this.maxVelocity += 3;
        this.render = Render.create({
            engine: this.engine,
            element : this.element,
            options: {
                background: generateColor(map),
                width: this.width,
                height: this.height,
                wireframes: false,
            }
        })
        this.generateObs();
        this.element.addEventListener('mousemove', this.boundHandleMouseMove);
        if (mod === "BOT"){
            this.createWorld();
            this.handleCollistion()
            this.handleBotMovement()
            Render.run(this.render);
            Runner.run(this.runner, this.engine);
        }
    }
    
    public updateState(p1: Vector, p2: Vector, ball: Vector){
        Body.setPosition(this.p1, {x:this.normalise(p1.x, 0, globalWidth, 0, this.width),y:this.normalise(p1.y, 0, globalHeight, 0, this.height)})
        Body.setPosition(this.p2, {x:this.normalise(p2.x, 0, globalWidth, 0, this.width),y:this.normalise(p2.y, 0, globalHeight, 0, this.height)})
        Body.setPosition(this.ball, {x:this.normalise(ball.x, 0, globalWidth, 0, this.width),y:this.normalise(ball.y, 0, globalHeight, 0, this.height)})
        Engine.update(this.engine);
    }

    public updateScore(s1: number, s2: number){
        this.score1 = s1;
        this.score2 = s2;
    }

    public startOnligneGame(p1: Vector, p2: Vector, ball: Vector, id: number){
        // create all elements of engine 
        this.Id = id;
        console.log("--------- >ID: ", this.Id);
        
        this.p1 = Bodies.rectangle(
            this.normalise(p1.x, 0, globalWidth, 0, this.width),
            this.normalise(p1.y, 0, globalHeight, 0, this.height),
            this.normalise(paddleWidth, 0, globalWidth, 0, this.width),
            this.normalise(paddleHeight, 0, globalHeight, 0, this.height),
            {
                isStatic: true,
                chamfer: {radius: 10 * this.calculateScale() },
                render: {fillStyle: 'purple'}
            }
        )
        this.p2 = Bodies.rectangle(
            this.normalise(p2.x, 0, globalWidth, 0, this.width),
            this.normalise(p2.y, 0, globalHeight, 0, this.height),
            this.normalise(paddleWidth, 0, globalWidth, 0, this.width),
            this.normalise(paddleHeight, 0, globalHeight, 0, this.height),
            {
                isStatic: true,
                chamfer: {radius: 10 * this.calculateScale() },
                render: {fillStyle: 'purple'}
            }
        )
        this.ball = Bodies.circle(
            this.normalise(ball.x, 0, globalWidth, 0, this.width),
            this.normalise(ball.y, 0, globalHeight, 0, this.height),
            10 * this.calculateScale(),
        )
        Body.setVelocity(this.ball, {x: this.normalise(this.ball.velocity.x, 0 , globalWidth, 0, this.width), y: this.normalise(this.ball.velocity.y, 0 , globalHeight, 0, this.height)})
        Composite.add(this.engine.world, [this.ball, this.p1, this.p2]);
        Composite.add(this.engine.world, [...this.obstacles]);
        Render.run(this.render);
        Runner.run(this.runner, this.engine);
    }

    public GameFinish(method: string){
        if (method === "GAMEOVER"){}
        else if (method === "WinOrLose"){}
        this.element.removeEventListener('mousemove', this.boundHandleMouseMove);
        this.destroyGame();
        //router.back();
    }
    public updateOnLigneSizeGame(element: HTMLDivElement){
        //stop the rendring , upadate the positions and velocity of all element
        this.element = element;
        [this.width, this.height] = this.calculateSise();
        this.render = Render.create({
            engine: this.engine,
            element : this.element,
            options: {
                background: generateColor(this.map),
                width: this.width ,
                height: this.height,
                wireframes: false,
            }
        })
        this.generateObs();
        this.startOnligneGame(
            {x: this.normalise(this.p1.position.x, 0 , globalWidth, 0, this.width), y: this.normalise(this.p1.position.y, 0 , globalHeight, 0, this.height)}, 
            {x: this.normalise(this.p2.position.x, 0 , globalWidth, 0, this.width), y: this.normalise(this.p2.position.y, 0 , globalHeight, 0, this.height)}, 
            {x: this.normalise(this.ball.position.x, 0 , globalWidth, 0, this.width), y: this.normalise(this.ball.position.y, 0 , globalHeight, 0, this.height)}, 
            this.Id
        )
    }

    private handleBotMovement(){
        Matter.Events.on(this.engine, "beforeUpdate", () => {
            if (this.map === "ADVANCED")
                Body.setPosition(this.p1,  { x: this.ball.position.x, y : this.p1.position.y})
            else if (this.map === "INTEMIDIER"){
                if (this.ball.position.x < this.height / 2)
                    Body.setPosition(this.p1,  { x: this.ball.position.x, y : this.p1.position.y})
                else
                    Body.setPosition(this.p1,  { x: this.width - this.p2.position.x, y : this.p1.position.y})

            }
            else{
                if (this.ball.position.x < this.height / 4)
                    Body.setPosition(this.p1,  { x: this.ball.position.x, y : this.p1.position.y})
                else
                    Body.setPosition(this.p1,  { x: this.width - this.p2.position.x, y : this.p1.position.y})

            }
        });
    }

    private createWorld(){
        this.p1 = Bodies.rectangle(
            this.normalise(globalWidth / 2, 0,globalWidth, 0, this.width),
            this.normalise( 20 , 0 , globalHeight , 0, this.height),
            this.normalise( paddleWidth , 0 , globalWidth , 0, this.width),
            this.normalise( paddleHeight , 0 , globalHeight , 0, this.height),
            {
                isStatic: true,
                chamfer: {radius: 10 * this.calculateScale() },
                render: {fillStyle: 'purple'}
            }
            
        );
        this.p2 = Bodies.rectangle(
            this.normalise(globalWidth / 2, 0,globalWidth, 0, this.width),
            this.normalise( 780 , 0 , globalHeight , 0, this.height),
            this.normalise( paddleWidth , 0 , globalWidth , 0, this.width),
            this.normalise( paddleHeight , 0 , globalHeight , 0, this.height),
            {
                isStatic: true,
                chamfer: {radius: 10 * this.calculateScale() },
                render: {fillStyle: 'blue'}
            }
        );

        this.ball = Bodies.circle(this.width / 2, this.height / 2, 10 * this.calculateScale(), 
            {
                restitution: 1,
                frictionAir: 0,
                friction:0,
                inertia: Infinity,
                render:{
                    fillStyle: "red"
                }
            }
        )
        Body.setVelocity(this.ball, {x: 5, y: 5});
        Composite.add(this.engine.world, [this.ball, this.p1, this.p2]);
        Composite.add(this.engine.world, [...this.obstacles]);

    }

    private mouseEvents(event: MouseEvent){
        // const socket  = useContext(WebsocketContext)
        let mouseX = event.clientX - (this.element.clientWidth / 2 - this.width / 2);
        // console.log(`divW : ${this.element.clientWidth} && canvasW: ${this.render.canvas.width} && y : ${this.p2.position.y}`);
        const paddleX = Math.min(Math.max((mouseX - this.normalise( paddleWidth , 0 , globalWidth , 0, this.width) / 2) + 10, (this.normalise( paddleWidth , 0 , globalWidth , 0, this.width) / 2) + 10), (this.width - this.normalise( paddleWidth , 0 , globalWidth , 0, this.width) / 2) - 10)
        console.log("ID: ", this.Id);
        
        if (this.mod === "BOT")Body.setPosition(this.p2, {x: paddleX, y: this.p2.position.y});
        else if (this.socket && this.mod === "RANDOM") this.socket.emit("UPDATE", {
            gameId: this.gameId,
            vec: {
                x: this.Id === 1 ? this.normalise(paddleX, 0, this.width, 0, globalWidth): this.normalise(this.width - paddleX, 0, this.width, 0, globalWidth) ,
                y : this.Id === 1 ? 780: 20
            }
        })
    }

    private calculateScale(): number {
        let scale: number = this.width / globalWidth;
        let scale2: number = this.height / globalHeight;
    
        return Math.min(scale, scale2);
    }

    public calculateSise(): [number, number]{
        let width: number, height: number;
        // console.log("element: " , this.element);
        
        if (this.element.clientHeight > this.element.clientWidth){
            width = this.element.clientWidth;
            height = width / aspectRatio;
            if (height > this.element.clientHeight){
                height = this.element.clientHeight;
                width = height * aspectRatio;
            }
        }else{
            height = this.element.clientHeight;
            width = height * aspectRatio;
            if (width > this.element.clientWidth){
                width = this.element.clientWidth
                height = width / aspectRatio;
            }
        }
        // console.log("calculate scale global aspect : ", aspectRatio);
        // console.log("calculate scale other  aspect : ", width / height);
        
        return [width, height]
    }

    private generateObs(){
        if (this.map === "ADVANCED")
            this.obstacles.push(
                Bodies.rectangle( 
                    3 * this.width / 4,
                    3 * this.height / 4,
                    this.normalise(100, 0, globalWidth, 0, this.width), 
                    this.normalise(10,0, globalHeight, 0, this.height), 
                    { isStatic: true, chamfer: { radius: 5 * this.calculateScale() } , render: {fillStyle: 'red'},  label: "ADV"}
                ),
                Bodies.rectangle(
                    this.width / 4, 
                    this.height / 4,
                    this.normalise(100, 0, globalWidth, 0, this.width), 
                    this.normalise(10,0, globalHeight, 0, this.height), 
                    { isStatic: true, chamfer: { radius: 5 * this.calculateScale() } , render: {fillStyle: 'red'} , label: "ADV"}
                ),
            )
        else if (this.map === "INTEMIDIER")
            this.obstacles.push(Bodies.rectangle(
                this.width / 4, 
                this.height / 4, 
                this.width / 2, 
                10, 
                { isStatic: true, chamfer: { radius: 10 * this.calculateScale() }, render: {fillStyle: 'red'} , label: "INT"}
            ))
        //add walls
        this.topWall = Bodies.rectangle(
            this.normalise((0 + globalWidth / 2), 0, globalWidth, 0, this.width),
            0,
            this.width,
            this.normalise(10, 0,globalHeight,0,this.height),
            wallOptions,
        );
        this.downWall = Bodies.rectangle(
            this.normalise((0 + globalWidth / 2), 0, globalWidth, 0, this.width),
            this.height,
            this.width,
            this.normalise(10, 0,globalHeight,0,this.height),
            wallOptions,
            
        )
        this.obstacles.push(this.topWall, this.downWall)
        this.obstacles.push(Bodies.rectangle(//left
            0,
            this.normalise((0 + globalHeight / 2), 0, globalHeight, 0, this.height),
            this.normalise(10, 0, globalWidth, 0, this.width),
            this.height,
            wallOptions,
        ))
        this.obstacles.push(Bodies.rectangle(//right
            this.width,
            this.normalise((0 + globalHeight / 2), 0, globalHeight, 0, this.height),
            this.normalise(10, 0, globalWidth, 0, this.width),
            this.height,
            wallOptions,
        ))
    }

    private normalise(x: number, a: number, b: number, c: number, d: number){
        // x in [a, b] && y in [c, d]
        // console.log(`x in [${a}, ${b}] = ${x}, y [${c}, ${d}] =${c + (d - c) * ((x - a) / (b - a))}`);
        
        return c + (d - c) * ((x - a) / (b - a));
    }

    private handleCollistion(){
        Matter.Events.on(this.engine, "collisionStart", (event) =>{
            event.pairs.forEach((pair)=>{
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                        
                        
                if (bodyA === this.ball || bodyB == this.ball){
                    const normal = pair.collision.normal;
                    const Threshold = 0.1;
                    if (Math.abs(normal.x) < Threshold){
                        const sign = Math.sign(this.ball.velocity.x);
                        const i = 0.5;
                        Body.setVelocity(this.ball, {
                            x: Math.min(this.ball.velocity.x + sign * i , this.maxVelocity),
                            y : this.ball.velocity.y
                        })
                        const restitution = 1; // Adjust this value for desired bounciness
                        const friction = 0; // Adjust this value for desired friction
                                        
                                // Set restitution and friction for the ball
                        Body.set(this.ball, { restitution, friction });
                                
                                // Set restitution and friction for the other body (if it's not static)
                        const otherBody = bodyA === this.ball ? bodyB : bodyA;
                        if (!otherBody.isStatic) {
                            Body.set(otherBody, { restitution, friction });
                        }
                        if (otherBody === this.topWall || otherBody === this.downWall){
                            if (otherBody === this.topWall) this.score1++;
                            else this.score2++;
                            Body.setPosition(this.ball, { x: this.width / 2, y: this.height / 2 });
                            Body.setVelocity(this.ball, { x: this.ball.velocity.x < 0 ? 5 : -5 , y: this.ball.velocity.y > 0 ? 5:  -5});
                        }
                                
                    }
                }            
            });
        }); 
    }
            
    public destroyGame(){
        Runner.stop(this.runner);
        Render.stop(this.render);
        if (this.mod === 'BOT'){
            this.element.removeEventListener('mousemove', this.boundHandleMouseMove);
            this.render.canvas.remove();
            Engine.clear(this.engine);
        }
    }
}

export default GameBot;
