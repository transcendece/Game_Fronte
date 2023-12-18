import { WebsocketContext } from "@/app/Contexts/WebSocketContext";
import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface RandomButtonsProps  {
    setMap: Dispatch<SetStateAction<string>>;
};

const RandomButtons : React.FC<RandomButtonsProps> = ()=>{
	const [showModal, setShowModal] = useState(false);
    const [mode, setMod] = useState('DEFI');
    const [map, setMap] = useState('BEGINNER');
	const socket :Socket = useContext(WebsocketContext);
    const handleMod = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setMod(event.target.value);
    };
	
    const handleMap = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setMap(event.target.value);
    };

    const Submit = ()=>{
		console.log("SUBMIT", socket.id);
		
		socket.emit("RANDOM", {
			map: map,
			mode: mode,			
		})
		setMap(map);
		setShowModal(false);
	}

	// useEffect(() => {
	// 	if (socket){
	// 		socket.connect();
	// 		console.log();
	// 		console.log("WEWE");
			
			
	// 	}
	// }, [socket])

	return (
		<>
		  <button
			className="w-[200px] h-[50px] bg-black text-[white] cursor-pointer text-base m-2.5 px-5 py-2.5 rounded-[5px] border-[none] hover:bg-[#AF6915]"
			type="button"
			onClick={() => setShowModal(true)}
		  >
		  Play with Random
		  </button>
		  {showModal ? (
			<>
			<div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
				<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
					<div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
						<h3 className="text-3xl font=semibold">Play With Randoms</h3>
						<button
						className=""
						onClick={() => setShowModal(false)}
						>
							<span className="text-black opacity-7 h-6 w-6 text-xl block bg-gray-400 py-0 rounded-full">
							x
							</span>
						</button>
					</div>
					<div className="relative p-6 flex-auto">
						<div>
							<input 
								type="radio"
								name="mapChoice"
								value="BEGINNER"
								checked={map === "BEGINNER"}
								onChange={handleMap}
								className="w-6 h-6 border-2 rounded-full text-[#AF6915] checked:bg-[#AF6915] checked:border-transparent"
								/><label>BEGINNER</label>

							<input 
								type="radio"
								name="mapChoice"
								value="INTEMIDIER"
								checked={map === "INTEMIDIER"}
								onChange={handleMap}
								className="w-6 h-6 border-2 rounded-full text-blue-500 checked:bg-blue-500 checked:border-transparent"
								/><label>INTEMIDIER</label>
							
							<input 
								type="radio"
								name="mapChoice"
								value="ADVANCED"
								checked={map === "ADVANCED"}
								onChange={handleMap}
								className="w-6 h-6 border-2 rounded-full text-blue-500 checked:bg-blue-500 checked:border-transparent"
								/><label>ADVANCED</label>

		  				</div>
						<div>
							<input
								type="radio"
								name="modsChoice"
								value="DEFI"
								checked={mode === 'DEFI'}
								onChange={handleMod}
								/>
                            <label>DEFI</label>

                            <input
                            type="radio"
                            name="modsChoice"
                            value="TIME"
                            checked={mode === 'TIME'}
                            onChange={handleMod}
                            />
                            <label>TIME</label>	
						</div>
						
					</div>
					<div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
					  <button
						className=" bg-black text-[white] cursor-pointer text-base m-2.5 px-5 py-2.5 rounded-[5px] border-[none] hover:bg-[#b44242de]"
						type="button"
						onClick={() => setShowModal(false)}
					  >
						Close
					  </button>
					  <button
						className="bg-black text-[white] cursor-pointer text-base m-2.5 px-5 py-2.5 rounded-[5px] border-[none] hover:bg-[#AF6915]"
						type="button"
						onClick={Submit}
					  >
						Submit
					  </button>
					</div>
				  </div>
				</div>
			</>
		  ) : null}
		</>
	  );
};

export default RandomButtons;