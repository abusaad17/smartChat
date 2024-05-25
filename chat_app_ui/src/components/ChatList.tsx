import { useNavigate } from "react-router-dom";
import Avatar, { genConfig } from "react-nice-avatar";
import moment from "moment";

// const users = [
//   {
//     id: 1,
//     name: "Angel Curtis",
//     avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//     chat: "Please help me find a goof montitor for ...",
//   },
//   {
//     id: 2,
//     name: "Zaire Dorwart",
//     avatar: "https://randomuser.me/api/portraits/women/1.jpg",
//     chat: "alright.",
//   },
//   {
//     id: 3,
//     name: "kelas Malam",
//     avatar: "https://randomuser.me/api/portraits/men/2.jpg",
//     chat: "Hello, how are you doing?",
//   },
//   {
//     id: 4,
//     name: "Jocelyn Gouse",
//     avatar: "https://randomuser.me/api/portraits/women/2.jpg",
//     chat: "Buy back 10k gallons, top up credit, b..",
//   },
//   {
//     id: 5,
//     name: "Jaylon Dias",
//     avatar: "https://randomuser.me/api/portraits/men/3.jpg",
//     chat: "Thank you mate!",
//   },
//   {
//     id: 6,
//     name: "Chance Rheil Madsen",
//     avatar: "https://randomuser.me/api/portraits/women/3.jpg",
//     chat: "Hello, how are you doing?",
//   },
//   {
//     id: 7,
//     name: "Livia Dias",
//     avatar: "https://randomuser.me/api/portraits/men/4.jpg",
//     chat: "I am looking for a good monitor under 20k",
//   },
// ];

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

interface ChatListProps {
  users: IUsers;
}

const ChatList: React.FC<ChatListProps> = ({ users }) => {
  console.log({ users });

  function convertTime(inputTime: string | undefined) {
    const currentTime = moment();
    const inputMoment = moment(inputTime);

    if (inputTime === undefined) {
      return "";
    }

    // Calculate the difference in hours
    const hoursDiff = currentTime.diff(inputMoment, "hours");

    if (hoursDiff > 24 && hoursDiff <= 48) {
      // If the time is more than 24 hours but less than or equal to 48 hours ago, return 'yesterday'
      return "yesterday";
    } else if (hoursDiff > 48) {
      // If the time is more than 48 hours ago, return the date in a specific format
      // You can adjust the format string according to your needs
      return inputMoment.format("DD-MM-YYYY");
    } else {
      // If the time is within the last 24 hours, you can format it however you like
      // For example, returning the time part only
      return inputMoment.format("LT");
    }
  }

  const navigate = useNavigate();

  return (
    <div>
      {users.map((user) => (
        <div key={user.organizerDetail[0]._id} className="flex py-4 items-center gap-4 w-full  ">
          <div className="relative">
            {/* <img src={user.photo} alt={user.organizerDetail[1].username} className="w-14 h-14 rounded-full object-cover" /> */}
            <Avatar className="w-14 h-14" {...genConfig(`${user.organizerDetail[0].username}`)} />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              console.log(user.organizerDetail[0].username);
              navigate(`/chat/${user.organizerDetail[0].username}`, {
                state: { chatUser: user, new: false },
              });
            }}
          >
            <div className="flex justify-between w-full ">
              <div className="font-medium text-lg">{user.organizerDetail[0].username}</div>
              {/* <span className="text-xs">{moment(user.msg.at(-1)?.createdAt).format("LT")}</span> */}
              <span className="text-xs">{convertTime(user.msg.at(-1)?.createdAt)}</span>
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
            <div className="text-sm font-light">
              {(() => {
                const lastMessage = user.msg.at(-1)?.msg;
                return lastMessage && lastMessage.length > 45 ? `${lastMessage.slice(0, 45)}...` : lastMessage;
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
