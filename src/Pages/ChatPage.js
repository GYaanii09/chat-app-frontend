import { Box } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider"

import SideDrawer from "../components/misc/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useState } from "react";

const ChatPage = () => {
    /*const [chats, setChats] = useState([]);

    const fetchChats = async()=>{ 
       const {data} = await axios.get('/api/chat');
       setChats(data);
       console.log(data);
    }
    useEffect(()=>{
        fetchChats();
    }, []);*/

  
  const {user} =   ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{width: '100%'}}>
      {user&& <SideDrawer />}
      
      <Box
        display = "flex"
        justifyContent='space-between'
        w ='100%'
        h ='91.5vh'
        p='10px'
      >
        {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
      </Box>
    </div>
  )
}

export default ChatPage;