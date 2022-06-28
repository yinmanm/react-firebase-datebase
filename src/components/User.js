import React, { useEffect, useState } from "react";
import Img from "../image1.jpg";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase";

const User = ({ user1, user, selectUser, chat }) => {
  const user2 = user?.uid;
  const [data, setData] = useState("");

  useEffect(() => {
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let unsub = onSnapshot(doc(db, "lastMsg", id), (doc) => {
      setData(doc.data());
    });
    return () => unsub();
  }, []);

  return (
    <>
      <li className="relative bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
        <div
          className={`user_wrapper ${chat.name === user.name && "selected_user"}`}
          onClick={() => selectUser(user)}>
          <div>
            <div className="">
              <div className="flex justify-between items-center space-x-3">
                <div className="flex-1 flex items-center space-x-3">
                  <img src={user.avatar || Img} alt="avatar" className="w-12 h-12 rounded-full" />
                  <p className="text-xl font-medium text-gray-900 truncate">{user.name}</p>
                  {data?.from !== user1 && data?.unread && (
                    <small className="unread">New</small>
                  )}
                </div>
                <div className={`user_status ${user.isOnline ? "online" : "offline"}`}></div>
              </div>
            </div>
            <div className="mt-1">
              <p className="line-clamp-2 text-sm text-gray-600">
                {data && (
                  <p className="line-clamp-2">
                    <strong>{data.from === user1 ? "Me:" : null}</strong>
                    {data.text}
                  </p>
                )}
              </p>
            </div>
          </div>
        </div>
      </li>
    </>
  );
};

export default User;
