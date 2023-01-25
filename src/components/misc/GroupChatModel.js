import React, { useState } from 'react'
import { Box,useDisclosure,Button,Modal,ModalBody,ModalBodyProps,ModalCloseButton,ModalContent,ModalFooter,ModalHeader,ModalOverlay, useToast, FormControl, Input } from '@chakra-ui/react';
import {ChatState} from "../../Context/ChatProvider";
import axios from 'axios';
import UserListItem from "../UserAvatar/UserListItem"
import UserBadgeItem from '../UserAvatar/UserBadgeItem';

const GroupChatModel = ({children}) => {
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading,setLoading] = useState(false);
    const toast = useToast();

    const handleSearch= async(query)=>{
      setSearch(query);
      if(!query){
        return;
      }
      try{
        setLoading(true);

        const config={
          headers:{
            Authorization:`Bearer ${user.token}`
          },
        };

        const {data} = await axios.get(`/api/user?search=${search}`, config)
        console.log(data);
        setLoading(false);
        setSearchResult(data);

      }catch(error){
        toast({
          title:"Error Occured!",
          description:"Failed to load the search results",
          status:"error",
          isClosable:true,
          duration:5000,
          position:"bottom-left",
        });
        setLoading(false);
      }
    }

    const handleSubmit= async()=>{
        if(!groupChatName|| !selectedUsers){
          toast({
            title:"Please fill all the fields",
            status:"warning",
            duration:5000,
            isClosable:true,
            position:"top",
          })
          return;
        }

        try{
          const config={
            headers:{
              Authorization:`Bearer ${user.token}`
            },
          };

          const {data} = await axios.post("/api/chat/group", {
            name: groupChatName,
            users:JSON.stringify(selectedUsers.map((u)=>u._id)),

          }, config)
          setChats([data,...chats]);
          onClose();
          toast({
            title:"Group chat created successfully",
            status:"success",
            duration:5000,
            isClosable:true,
            position:"bottom",
          });
          setSearchResult([]);
          setSelectedUsers([]);
        }
        catch(error){
          toast({
            title:"Failed to create a chat",
            description:error.response.data,
            status:"error",
            duration:5000,
            isClosable:true,
            position:"bottom",
          });
        }
    }

    const handleDelete =(user)=>{
      setSelectedUsers(
        selectedUsers.filter(sel=>sel._id!==user._id)
      )
    }

    const handleGroup=(userToAdd)=>{
      if(selectedUsers.includes(userToAdd)){
        toast({
          title:"User Already added",
          status:"warning",
          duration:5000,
          isClosable:true,
          position:"top",
        })
        return;
      }
      setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const {user, chats,setChats} = ChatState();
  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="25px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
            >Create group chat
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
          >

            <FormControl>
              <Input
                placeholder='Chat Name'
                mb={3}
                onChange={(e)=>setGroupChatName(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <Input
                placeholder='Add users'
                mb={1}
                onChange={(e)=>handleSearch(e.target.value)}
              />
            </FormControl>

            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map(u=>(
                <UserBadgeItem key={user._id} user={u}
                handleFunction={()=>handleDelete(u)} />
              ))}
            </Box>

          {loading?<div>loading..</div> : (
            searchResult?.slice(0,4).map(user=>(
              <UserListItem
                key = {user._id}
                user = {user}
                handleFunction={()=>handleGroup(user)}
              />

            ))
          )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue'  onClick={handleSubmit}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GroupChatModel