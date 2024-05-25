import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, FileDown, SendHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { useAuth } from "@/context/AuthProvider";
import { backendURL } from "@/appConfig";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import moment from "moment";
import Avatar, { genConfig } from "react-nice-avatar";

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

interface IOtherChatUsersItem {
  id: string;
  username: string;
  email: string;
}

interface iState {
  chatUser: IUsersItem | IOtherChatUsersItem;
  newUser: boolean;
}

interface iSendMessage {
  message: string;
  roomId: string | undefined;
  id: string | undefined;
}

const Chat = () => {
  // const userName = useParams().id;
  const { state } = useLocation();
  const { chatUser, newUser }: iState = state;
  const socket = useSocket();
  const { isAuthenticated, token, user } = useAuth();
  const clientId1: string | undefined = user?.id;
  const clientId2: string | undefined = newUser
    ? "id" in chatUser
      ? chatUser.id
      : undefined
    : "organizerDetail" in chatUser && chatUser.organizerDetail && chatUser.organizerDetail.length > 0
    ? chatUser.organizerDetail[0]._id
    : undefined;
  const navigate = useNavigate();
  // const roomIdRef = useRef<string | undefined>(undefined);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<MsgItem[] | []>("msg" in chatUser ? chatUser.msg : []);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [generateOrderLoading, setGenerateOrderLoading] = useState<boolean>(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(
    async (message: iSendMessage) => {
      console.log("user and room id: ", user, ", ", roomId);
      if (roomId) {
        // socket.emit(`messageUpdate/${roomIdRef.current}`, messageJSON);
        //http call
        try {
          const data = await fetch(`${backendURL}/send-message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(message),
          });
          console.log("Message Sent to server", message);
          if (data.status === 200) {
            const json = await data.text();
            console.log(json);
          } else {
            console.log("error sending message", data);
          }
        } catch (error) {
          console.error("error sending data", error);
        }
      }
    },
    [token, user, roomId]
  );

  async function fetchPDF(options: string | undefined): Promise<void> {
    try {
      setGenerateOrderLoading(true);
      const response = await fetch(`${backendURL}/generate-po`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId: options }), // Assuming the endpoint expects a JSON payload
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const pdfBase64 = await response.text(); // Get the base64 encoded PDF
      const pdfBlob = base64ToBlob(pdfBase64, "application/pdf"); // Convert base64 to a Blob

      // Example: Display the PDF in a new browser tab
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      // window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error("Error fetching PDF:", error);
    } finally {
      setGenerateOrderLoading(false);
    }
  }

  function base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  const handleDownloadPdf = (pdfUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = filename; // Provide a filename for the downloaded PDF
    document.body.appendChild(link); // Append to the document body
    link.click(); // Trigger the download
    document.body.removeChild(link); // Remove the link from the document
  };

  useEffect(() => {
    const getRoomId = async (clientId1: string, clientId2: string): Promise<void> => {
      console.log("this is called!", clientId1, "clientId2: ", clientId2);
      try {
        const response = await fetch(`${backendURL}/get-channel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include the authorization token if needed
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ clientId1, clientId2 }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("room id received :", data.roomId);
        setRoomId(data.roomId); // Assuming the server responds with an object that has a roomId property
        socket.emit("joinRoom", data.roomId);
      } catch (error) {
        console.error("Error fetching channel:", error);
      }
    };

    if (clientId1 && clientId2) {
      getRoomId(clientId1, clientId2);
    }
  }, [clientId1, clientId2, socket, token]);

  useEffect(() => {
    // Scroll to bottom when page loads
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const receivedMessage = (msg: MsgItem | MsgItem[]) => {
      console.log("Message Received from server", msg);
      console.log("nnew message array: ", [...messages, msg]);
      if (Array.isArray(msg)) {
        setMessages([...messages, ...msg]);
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    };

    if (socket && roomId) {
      // socket.on(`initialMessage/${roomIdRef.current}`, (msg: iMessage[] | iMessage) => initialMessage(msg));
      console.log("subscribed to", `messageUpdate/${roomId}`);
      socket.on(`messageUpdate/${roomId}`, (msg: MsgItem) => receivedMessage(msg));
      // socket.on(`messageUpdate`, (msg: iMessage[] | iMessage) => receivedMessage(msg));
    }

    return () => {
      socket.off(`messageUpdate/${roomId}`, (msg: MsgItem) => receivedMessage(msg));
      // socket.off(`initialMessage/${roomIdRef.current}`, initialMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId]);

  if (!isAuthenticated || !user) {
    navigate("/");
  }

  return isAuthenticated ? (
    <div className="flex flex-col justify-between w-full h-full">
      <header className="px-4 py-4  border-b shadow-sm flex justify-between items-center gap-2 bg-[#EEFFB1] fixed w-full z-10">
        <div className="flex items-center gap-2 ">
          <ChevronLeft
            className="cursor-pointer"
            onClick={() => {
              navigate("/home");
            }}
          />
          <div className="relative">
            {/* <img src={user?.avatar} alt={username} className="w-14 h-14 rounded-full object-cover" /> */}
            <Avatar
              className="w-14 h-14"
              {...genConfig(`${"username" in chatUser ? chatUser.username : chatUser.organizerDetail[0].username}`)}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="flex flex-col ">
            <span className="font-bold">
              {"username" in chatUser ? chatUser.username : chatUser.organizerDetail[0].username}
            </span>
            <span>online</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {pdfUrl ? (
            <FileDown className="w-8 h-8 cursor-pointer" onClick={() => handleDownloadPdf(pdfUrl, "generated-order")} />
          ) : (
            <></>
          )}
          <Button
            onClick={() => {
              fetchPDF(roomId);
            }}
            disabled={generateOrderLoading}
          >
            {generateOrderLoading ? <LoadingSpinner /> : <></>}{" "}
            {generateOrderLoading ? "Generating Order" : " Generate Order"}
          </Button>
        </div>
      </header>
      <div className="messages-bottom-bar mt-24 flex-grow overflow-hidden relative">
        <div className="messages flex flex-col gap-4 p-4 overflow-y-auto h-[93%] " ref={messagesContainerRef}>
          {messages.length > 0 &&
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex flex-col gap-1 ${message.createdBy === clientId1 ? "items-end" : "items-start"}`}
              >
                <div className={` ${message.createdBy === clientId1 ? "bg-[#EEFFB1]" : "bg-blue-100"}  p-2 rounded-xl`}>
                  {message.msg}
                </div>
                <span className="text-xs">{moment(message.createdAt).format("LT")}</span>
              </div>
            ))}
        </div>
        <div className="bottom-bar absolute bottom-0 left-0  w-full">
          <form
            className="flex gap-2 p-3 border bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              console.log(newMessage);
              const newStateMsg = {
                message: newMessage,
                roomId: roomId,
                id: clientId1,
              };
              // Correctly update the messages state
              // setMessages((prevMessages) => [...prevMessages, newStateMsg]);
              sendMessage(newStateMsg);
              setNewMessage("");
            }}
          >
            <Input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              className="py-2 px-4  focus-visible:ring-0 focus-visible:border-black"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNewMessage(e.target.value);
              }}
            />
            <Button type="submit">
              <SendHorizontal />
            </Button>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center w-full h-full">
      <LoadingSpinner />
    </div>
  );
};

export default Chat;
