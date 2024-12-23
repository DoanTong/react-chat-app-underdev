import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import Lottie from "react-lottie"
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES, HOST, SEARCH_CONTACTS_ROUTES } from "@/ultis/constants.js";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import MultipleSelector from "@/components/ui/multipleselect";
import { Button } from "@/components/ui/button";


  

const CreateChannel = () => {
    const {setSelectedChatType, setSelectedChatData, addChannel} = useAppStore();

    const [newChannelModal, setNewChannelModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState("");

    useEffect(() =>{
        const getData = async () =>
        {
            const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
                withCredentials:true, 
            });
            setAllContacts(response.data.contacts);
        };
        getData();
    },[]);
    const createChannel = async () =>
        {
            try {
                if (channelName.length > 0 && selectedContacts.length > 0) 
                {
                   const response = await apiClient.post(
                                CREATE_CHANNEL_ROUTE,
                                {
                                    name: channelName,
                                    members: selectedContacts.map((contact) => contact.value),
                                },
                                { withCredentials: true }
                                );
                           if (response.status === 201) {
                  setChannelName("");
                  setSelectedContacts([]);
                  setNewChannelModal(false);
                  addChannel(response.data.channel);
                }     
                }       
              } catch (error) {
                console.error({error})
              }    
        };
    return (
        <>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                   <FaPlus
                   className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300 "
                   onClick={()=>setNewChannelModal(true)}
                   />
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">Tạo nhóm mới</TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
            <DialogContent className="bg-[#181920] border-none text-white w-full max-w-md h-auto p-6 flex flex-col">
                <DialogHeader>
                <DialogTitle>Chọn người bạn muốn Liên Hệ</DialogTitle>
                <DialogDescription></DialogDescription>
                </DialogHeader>
                <div >
                    <Input placeholder="Tên nhóm" className="rounded-lg p-6 bg-[#2c2e3b] border-none" 
                    onChange = {e=>setChannelName(e.target.value)}
                    value= {channelName}
                    />
                </div>  
                <div>
                    <MultipleSelector 
                        className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                        defaultOptions={allContacts}
                        placeholder ="   Tìm bạn"
                        value={selectedContacts}
                        onChange={setSelectedContacts}
                        emptyIndicator={
                            <p className="text-center text-lg leading-10 text-gray-600">
                                Không có kết quả, đồ không có bạn bè hihi !!!
                            </p>
                        }
                    />
                </div> 
                <div>
                    <Button className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                    onClick={createChannel}>Tạo nhóm</Button>
                </div> 
            </DialogContent>
        </Dialog>

        </>
    );
};

export default CreateChannel;