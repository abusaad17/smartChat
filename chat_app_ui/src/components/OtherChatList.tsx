import { useNavigate } from "react-router-dom";
import Avatar, { genConfig } from "react-nice-avatar";

type IOtherChatUsers = IOtherChatUsersItem[];

interface IOtherChatUsersItem {
  id: string;
  username: string;
  email: string;
}

interface ChatListProps {
  users: IOtherChatUsers;
}

const OtherChatList: React.FC<ChatListProps> = ({ users }) => {
  console.log({ users });

  const navigate = useNavigate();

  return (
    <div>
      {users.map((user) => (
        <div key={user.id} className="flex py-4 items-center gap-4 w-full  ">
          <div className="relative">
            {/* <img src={user.photo} alt={user.organizerDetail[1].username} className="w-14 h-14 rounded-full object-cover" /> */}
            <Avatar className="w-14 h-14" {...genConfig(`${user.username}`)} />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              console.log(user.username);
              navigate(`/chat/${user.username}`, {
                state: { chatUser: {...user, msg:[]}, newUser: true },
              });
            }}
          >
            <div className="flex justify-between w-full ">
              <div className="font-medium text-lg">{user.username}</div>
              {/* <span className="">{moment(user.msg.at(-1)?.createdAt).format("LT")}</span> */}
            </div>
            {/* {Math.random() * 10 > 5 ? (
              <div className="text-sm font-light">{user.chat}</div>
            ) : (
              <div className="font-medium text-sm relative">
                {user.chat}{" "}
                <div className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full">
                  {Math.floor(Math.random() * 4 + 1)}
                </div>
              </div>
            )} */}
            {/* <div className="text-sm font-light">{user.msg.at(-1)?.msg}</div> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OtherChatList;
