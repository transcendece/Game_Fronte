import Modal from "../components/modal"
import React from "react";
import { RootState, useAppDispatch } from "../store/store";
import { Action } from "../Slices/userSettingsSlice";
import { useSelector } from "react-redux";


type friends = {
  name : string;
  online : boolean;
  inGame : boolean;
}

type CardData = {
    user : string;
    title : string;
};

type bodyData = {
  username : string;
}

function FriendsCard(props : CardData) {
    const dispatch = useAppDispatch();
    const data = useSelector((state: RootState) => state.userSettings.friends)
    function handleClick(endpoint: string | undefined, username: string) {
        if (!endpoint)
          return
        const bodyData : bodyData = {
          username : username,
        }
        console.log(`http://localhost:4000/Chat/${endpoint}`);
        dispatch(Action({endpoint : endpoint, bodyData : bodyData}));
      }
      let myMap = new Map<string, string>();
      myMap.set("Friends","removeFriend");
    return (
        <div className="w-[20%] h-[30%] flex flex-col m-5 p-5 bg-[#30313E] items-center rounded-md">
            <div className="w-[50%] flex flex-row justify-around">
                <h3>{props.title}</h3>
                {props.title != "Friends" && <Modal content="+" title={props.title}/>}
            </div>
            <div className=" w-[50%] h-[10%] flex flex-col">
             {data  && data?.map((user, index)=> {
                return (
                  <div key={index} className="w-full flex flex-row p-2 justify-around">
                    <div><p>{user.name}</p></div>
                    {user.online && !user.inGame && <div className="text-white rounded-sm truncate bg-green-600"><p >Online</p></div>}
                    {user.inGame && <div className="text-white rounded-full border bg-yellow-600"><p>InGame</p></div>}
                    {!user.online && !user.inGame &&  <div className="text-white rounded-full  bg-gray-600"><p>offline</p></div>}
                    <div><button className="text-red-600" onClick={() => handleClick(myMap.get(props.title), user.name)}>X</button></div>
                  </div>
                    )
                })}
            </div>
        </div>
    );
}


export default FriendsCard;