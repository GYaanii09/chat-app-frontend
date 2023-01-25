import React, { useState } from 'react'
import { ViewIcon } from '@chakra-ui/icons';
import { useDisclosure,Button, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useToast,
  Box,
  FormControl,
  Input,
  Spinner, } from '@chakra-ui/react';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModel = ({fetchAgain, setFetchAgain, fetchMessages}) => {

   
    const {selectedChat, setSelectedChat, user} = ChatState();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [renameloading, setRenameloading] = useState(false);

    const toast = useToast();

    const handleRename = async()=>{
        if(!groupChatName) return;

        try{
            setRenameloading(true);
            const config={
                headers:{
                    Authorization:`Bearer ${user.token}`,
                },
            };

            const {data} = await axios.put('/api/chat/rename', 
            {
                chatId:selectedChat._id,
                chatName:groupChatName,
            },
            config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameloading(false);
        }catch(error){
            toast({
                title:"Error Occured!",
                description:error.reponse.data.message,
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            })
            setRenameloading(false);
        }
        setGroupChatName("")
    }

    const handleRemove = async(user1)=>{
        if(selectedChat.groupAdmin._id!==user._id && user1._id!==user._id){
        toast({
          title:"Only admin can remove someone!",
          status:"error",
          duration:3000,
          isClosable:true,
          position:"bottom"
        })
        return;
      }

      try{
        setLoading(true);
        const config={
          headers:{
            Authorization:`Bearer ${user.token}`
          }
        };

        const {data} = await axios.put('/api/chat/groupremove',{
          chatId: selectedChat._id,
          userId: user1._id,
        }, config);

        user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        fetchMessages();
        setLoading(false);
      }
      catch(error){
        toast({
          title:"Error Occured!",
          description:error.response.data.message,
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom",
        });
        setLoading(false);
      }
    }


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
    };

    const handleAddUser= async(user1)=>{
      if(selectedChat.users.find((u)=>u._id===user1._id)){
        toast({
          title:"User Already exists in the group!",
          status:"error",
          duration:3000,
          isClosable:true,
          position:"bottom"
        })
        return;
      }

      if(selectedChat.groupAdmin._id==user._id){
        toast({
          title:"Only admin can add someone!",
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom",
        })
        return;
      }
      
      try{
        setLoading(true);
        const config={
          headers:{
            Authorization:`Bearer ${user.token}`
          }
        };

        const {data} = await axios.put('/api/chat/groupadd',{
          chatId: selectedChat._id,
          userId: user1._id,
        }, config);

        setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setLoading(false);
      }
      catch(error){
        toast({
          title:"Error Occured!",
          description:error.response.data.message,
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom"
        });
        setLoading(false);
      }

    }

  return (
    <div>
      <IconButton display={{base:"flex"}} icon={<ViewIcon/>} onClick={onOpen}/>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="25px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
             
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                {selectedChat.users.map(u=>(
                    <UserBadgeItem key={user._id} user={u}
                handleFunction={()=>handleRemove(u)} />
                ))}
            </Box>

            <FormControl  display="flex">
                <Input
                    placeholder='Chat Name'
                    mb={3}
                    value={groupChatName}
                    onChange={(e)=>setGroupChatName(e.target.value)}
                />
                <Button
                    variant='solid'
                    colorScheme='teal'
                    ml={1}
                    isLoading={renameloading}
                    onClick={handleRename}
                >
                    Update
                </Button>
            </FormControl>

            <FormControl>
                <Input
                    placeholder='Add User to group'
                    mb={1}
                    onChange={(e)=>handleSearch(e.target.value)}
                />
            </FormControl>

            {loading?(
              <Spinner size="md" />
            ):(
              searchResult?.slice(0,4).map((user)=>(
                <UserListItem 
                  key={user._id}
                  user={user}
                  handleFunction={()=> handleAddUser(user)}
                />
              ))
            )}
            
  
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={()=>handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>

        </ModalContent>
      </Modal>
    </div>
  )
}

export default UpdateGroupChatModel