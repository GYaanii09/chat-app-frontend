import React, { useEffect, useState } from 'react'
import {ChatState} from "../Context/ChatProvider";
import {Avatar, Box, Button, Stack,Text, useToast} from "@chakra-ui/react";
import axios from "axios";
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getSender, getSenderFull } from '../config/ChatLogics';
import GroupChatModel from './misc/GroupChatModel';

const MyChats = ({fetchAgain}) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const [chatData, setChatData] = useState([]);

  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config={
        headers:{
          Authorization:`Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
    //  console.log(Object.values(data));
      setChats(data)
      console.log(chats);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: `Failed to Load the Chats: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  /*const renderChats= ()=>{
      for(var i=0; i<chats.length; i++){
        setChatData([ ...chatData,
          <Box
                onClick={()=>setSelectedChat(chats[i])}
                cursor="pointer"
                bg={selectedChat===chats[i]?"#38B2AC":"#E8E8E8"}
                color={selectedChat===chats[i]?"white":"black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chats[i]._id}
              >
                <Text>
                  {!chats[i].isGroupChat?(
                    getSender(loggedUser,chats[i].users)
                  ):chats[i].chatName}
                </Text>
          </Box>
      ])
    }
  }*/

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
   // renderChats();
  }, [fetchAgain]);

 // console.log(chatData);

  return (
    <div>
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "95vw", md: "50vw", lg:"35vw" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        
        justifyContent="space-between"
        alignItems="center"
        h="90%"
      >
        My Chats
        <GroupChatModel>
          <Button
          d="flex"
          fontSize={{base:"17px",md:"10px",lg:"17px"}}
          rightIcon={<AddIcon/>}
          >
          New Group Chat
        </Button>
        </GroupChatModel>
      </Box>

      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              > 
                 
                <Text>
                  {
                    !chat.isGroupChat     
                    ?(<Avatar mr={2} size='sm' cursor='pointer'  name={getSenderFull(loggedUser, chat.users).name} src={getSenderFull(loggedUser, chat.users).pic}/>):<></>
                  } 
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
               
              </Box>
            ))}
          </Stack>
        ):(
          <ChatLoading/>
        )}
      </Box>

    </Box>
    </div>
  )
}

export default MyChats;