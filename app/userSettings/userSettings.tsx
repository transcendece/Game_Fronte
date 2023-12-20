'use client';
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../store/store";
import Card from "./Card";
import React, { useEffect, useState } from 'react';
import { fetchUserSettings } from "../Slices/userSettingsSlice";

type userSettingsData = {
    user :      string;
    invitations : string[];
    friends     : string[];
    bandUsers   : string[];
};
 
function UserSettings() {
    const dispatch = useAppDispatch();
    const userSettingsData : userSettingsData = useSelector((state: RootState) => state.userSettings)
    const [data, setData] = useState<userSettingsData>({
        user: "",
        friends: [],
        bandUsers: [],
        invitations : []
    });
    
    const fetchInfo = () => { 
        return fetch("http://localhost:4000/Chat/userSettings", {
            method : "GET",
            credentials : 'include'
        }) 
                .then((res) => res.json()) 
                .then((d) => 
                {
                    setData(d.data)
                    console.log(d);
                }).catch((error) => {
                    console.error('Error:', error);
                })
        }
        
        useEffect(() => {
            dispatch(fetchUserSettings());
            console.log(data?.friends);
        }, [])
        console.log("fetched Data : ", userSettingsData);
    return (
            <div className="h-full w-full flex flex-row items-center justify-around">
                <Card data={userSettingsData.friends} title="Friends" user={userSettingsData.user}/>
                <Card data={userSettingsData.bandUsers} title="BandUsers" user={userSettingsData.user}/>
                <Card data={userSettingsData.invitations} title="Invitations" user={userSettingsData.user}/>
            </div>
    );
}

export default UserSettings;