import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, FormControl, IconButton, Input, Spinner, Text, Toast, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModel from './misc/ProfileModel';
import UpdateGroupChatModel from './misc/UpdateGroupChatModel';
import ScrollableChat from './ScrollableChat';
import axios from 'axios';
import './styles.css';

import io from 'socket.io-client';
const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;


const SingleChat = ({fetchAgain, setFetchAgain}) => {
    const {user,selectedChat, setSelectedChat, chats} =  ChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading ] = useState(false);
    const [newMessage, setNewMessage] = useState();

    const [socketConnected, setSocketConnected] = useState(false);

    const toast = useToast();
    //console.log(selectedChat);

    const fetchMessages = async()=>{
        if(!selectedChat){
            return;
        }
        try {

            const config={
                headers:{
                    "Content-type":"application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const {data} = await axios.get(`/api/message/${selectedChat._id}`, config);

            setMessages(data);
            setLoading(false);
            socket.emit('join chat', selectedChat._id);
            //console.log(messages);
        } catch (error) {
            toast({
                title:"Error occured",
                description:"Failed to load messages",
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom",
            })
        }
    }
    
    const sendMessage= async(event)=>{
        if(event.key==="Enter" && newMessage){
            try {

                const config={
                    headers:{
                        "Content-type":"application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                setNewMessage("");
                const {data} = await axios.post('/api/message',{
                    content: newMessage,
                    chatId : selectedChat._id
                }, config);
                //console.log(data);
                socket.emit('new message', data);
                setMessages([...messages, data]);

            } catch (error) {
                toast({
                    title:"Error occured!",
                    description: "Failed to send the Message",
                    status:"error",
                    duration:5000,
                    isClosable:true,
                    position:"bottom",
                })
            }
        }
    }

    useEffect(()=>{
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connection", ()=> setSocketConnected(true));
    }, [])

    useEffect(()=>{
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat, chats]);
    
    useEffect(()=>{
        socket.on('message received', (newMessageRecieved)=>{
            if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id){
                //notification
            }
            else{
                setMessages([...messages, newMessageRecieved]);
            }
        });
    })


    const typingHandler=(e)=>{
        setNewMessage(e.target.value);
        //Typing indicator logic

    }

  return (
    <>
    {selectedChat?(
        <>
            <Text
              fontSize={{base:"20px", md:"30px"}}
              pb={3}
              px={2}
              w="100%"
              fontFamily="Work sans"
              display="flex"
              justifyContent={{base:"space-between"}}
              alignItems="center"
            >
                <IconButton
                    display={{base:"flex", md:"none"}}
                    icon={<ArrowBackIcon/>}
                    onClick={()=>setSelectedChat("")}
                />
                {!selectedChat.isGroupChat?(
                    <>
                    {getSender(user,selectedChat.users)}
                    <ProfileModel user={getSenderFull(user, selectedChat.users)}/>
                    </>
                ):(
                    <>
                    {selectedChat.chatName.toUpperCase()}
                    <UpdateGroupChatModel
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                        fetchMessages={fetchMessages}
                    />
                    </>
                )}
            </Text>
            <Box
                display="flex"
                flexDir="column"
                justifyContent="flex-end"
                padding={3}
                bg="#E8E8E8"
                w="100%"
                h="77vh"
                borderRadius="lg"
                overflowY="hidden"
            >
                {loading?(
                    <Spinner
                       size="xl"
                       w={20}
                       h={20}
                       alignSelf="center"
                       margin="auto"  
                    />
                ): (
                <div className='messages'>
                    <ScrollableChat messages={messages}/>
                </div>)}

                <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                    <Input
                        variant="filled"
                        bg="#E0E0E0"
                        placeholder="Enter a message..."
                        onChange={typingHandler}
                        value={newMessage}
                    />
                </FormControl>
            </Box>
        </>
    ):(
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                Click on a user to start chatting
            </Text>
        </Box>
    )}
    </>
  )
}

export default SingleChat