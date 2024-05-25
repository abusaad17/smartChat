import ChatList from "@/components/ChatList";
import { Input } from "@/components/ui/input";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { backendURL } from "../appConfig";
import { LoadingSpinner } from "../components/LoadingSpinner";
import Avatar, { genConfig } from "react-nice-avatar";
import { LogOut } from "lucide-react";
import OtherChatList from "@/components/OtherChatList";

type IUsers = IUsersItem[];

interface IUsersItem {
  msg: MsgItem[];
  organizerDetail: OrganizerDetailItem[];
}
interface MsgItem {
  msg: string;
  createdBy: string;
  createdAt: string;
  _id: string;
}
interface OrganizerDetailItem {
  _id: string;
  username: string;
  email: string;
  password: string;
  __v: number;
}

type IOtherChatUsers = IOtherChatUsersItem[];
interface IOtherChatUsersItem {
  id: string;
  username: string;
  email: string;
}

const Home = () => {
  const [chatUsers, setChatUsers] = useState<IUsers>([]);
  const [otherChatUsers, setOtherChatUsers] = useState<IOtherChatUsers>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [chatListLoading, setChatListLoading] = useState<boolean>(true);
  const [otherChatListLoading, setOtherChatListLoading] = useState<boolean>(true);
  const { isAuthenticated, token, user, setIsAuthenticated, setToken, setUser } = useAuth();
  const navigate = useNavigate();
  console.log({ isAuthenticated, token });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const removeOrganizerById = (data: IUsersItem[], idToRemove: string | undefined): IUsersItem[] => {
      return data.map((item) => ({
        ...item,
        organizerDetail: item.organizerDetail.filter((organizer) => organizer._id !== idToRemove),
      }));
    };
    const getChatUserList = async () => {
      setChatListLoading(true);
      try {
        const data = await fetch(`${backendURL}/user-list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.status === 200) {
          const json = await data.json();
          const updatedChatUser: IUsers = removeOrganizerById(json, user?.id);
          updatedChatUser.sort((a, b) => {
            /// Get the last message's createdAt time for object a, or set to a default date if msg is empty
            const lastMsgATime = a.msg.length > 0 ? new Date(a.msg[a.msg.length - 1].createdAt).getTime() : 0;
            // Get the last message's createdAt time for object b, or set to a default date if msg is empty
            const lastMsgBTime = b.msg.length > 0 ? new Date(b.msg[b.msg.length - 1].createdAt).getTime() : 0;
            // Compare the numeric timestamps to determine the order
            return  lastMsgBTime - lastMsgATime;
          });

          console.log(updatedChatUser);
          setChatUsers(updatedChatUser);
          console.log(updatedChatUser);
        } else {
          console.log("error loading user list", data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setChatListLoading(false);
      }
    };
    const getOtherChatUserList = async () => {
      setOtherChatListLoading(true);
      try {
        const data = await fetch(`${backendURL}/other-user-list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.status === 200) {
          const json = await data.json();
          // const updatedOtherChatUser: IUsers = removeOrganizerById(json, user?.id);
          setOtherChatUsers(json);
          console.log(json);
        } else {
          console.log("error loading user list", data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setOtherChatListLoading(false);
      }
    };
    getChatUserList();
    getOtherChatUserList();
  }, [token, user?.id]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return isAuthenticated ? (
    <div>
      <header className="flex justify-between items-center px-4 py-4 bg-[#EEFFB1]  ">
        <span className=" text-2xl font-raleway font-medium"> {user?.username}</span>
        <div className="flex gap-4 justify-center items-center">
          <Avatar className="w-14 h-14" {...genConfig(`${user?.username}`)} />
          <LogOut className="w-4 h-4" onClick={handleLogout} />
        </div>
      </header>
      <div className="p-2 flex flex-col gap-4 font-raleway ">
        <Input
          className="rounded-xl py-6 px-4 focus-visible:ring-0 focus-visible:border-black"
          placeholder="search chats"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
        <div className="font-medium text-xl">Chats ({chatUsers.length})</div>
        {!chatListLoading ? (
          <>
            {searchTerm.length > 0 ? (
              <ChatList
                users={chatUsers.filter((user) =>
                  user.organizerDetail.some((organizer) =>
                    organizer.username.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                )}
              />
            ) : (
              <ChatList users={chatUsers} />
            )}
          </>
        ) : (
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
        )}
        <div className="font-medium text-xl">New Chats ({otherChatUsers.length})</div>
        {!otherChatListLoading ? (
          <>
            {searchTerm.length > 0 ? (
              <OtherChatList
                users={otherChatUsers.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))}
              />
            ) : (
              <OtherChatList users={otherChatUsers} />
            )}
          </>
        ) : (
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center w-full h-full">
      <LoadingSpinner />
    </div>
  );
};

export default Home;
