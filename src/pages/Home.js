import React, { useEffect, useState } from "react";
import { db, auth, storage } from "../firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import User from "../components/User";
import MessageForm from "../components/MessageForm";
import Message from "../components/Message";

const Home = () => {
  

  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [msgs, setMsgs] = useState([]);

  const user1 = auth.currentUser.uid;

  useEffect(() => {
    const usersRef = collection(db, "users");
    // create query object
    const q = query(usersRef, where("uid", "not-in", [user1]));
    // execute query
    const unsub = onSnapshot(q, (querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      setUsers(users);
    });
    return () => unsub();
  }, []);

  const selectUser = async (user) => {
    setChat(user);

    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMsgs(msgs);
    });

    // get last message b/w logged in user and selected user
    const docSnap = await getDoc(doc(db, "lastMsg", id));
    // if last message exists and message is from selected user
    if (docSnap.data() && docSnap.data().from !== user1) {
      // update last message doc, set unread to false
      await updateDoc(doc(db, "lastMsg", id), { unread: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user2 = chat.uid;

    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    let url;
    if (img) {
      const imgRef = ref(
        storage,
        `images/${new Date().getTime()} - ${img.name}`
      );
      const snap = await uploadBytes(imgRef, img);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = dlUrl;
    }

    await addDoc(collection(db, "messages", id, "chat"), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
    });

    await setDoc(doc(db, "lastMsg", id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
      unread: true,
    });

    setText("");
    setImg("");
  };
  return (
    <>
      <div className="h-screen flex flex-col" style={{marginTop:"-70px", paddingTop:"70px"}}>

        {/* Bottom section */}
        <div className="min-h-0 flex-1 flex overflow-hidden">
          {/* Main area */}
          <main className="min-w-0 flex-1 border-t border-gray-200 lg:flex">
            <section
              aria-labelledby="message-heading"
              className="min-w-0 flex-1 h-full flex flex-col overflow-hidden lg:order-last"
            >
              <div className="min-h-0 flex-1 flex flex-col overflow-y-auto no-scroll-bar">
                <ul role="list" className="messages_container flex-1 flex flex-col pb-4 sm:px-6 lg:px-8">
                {chat ? (
                  <li className="flex-1 bg-white pb-14 relative">
                    <div className="">
                      <div className="messages_user">
                        <h3 className="text-lg font-medium my-4">{chat.name}</h3>
                      </div>
                      <div className="messages">
                        {msgs.length
                          ? msgs.map((msg, i) => (
                              <Message key={i} msg={msg} user1={user1} />
                            ))
                          : null}
                      </div>
                    </div>
                    <MessageForm
                      handleSubmit={handleSubmit}
                      text={text}
                      setText={setText}
                      setImg={setImg}
                    />
                  </li>
                ) : (
                  <li className="flex-1 flex justify-center items-center">
                    <h3 className="no_conv">Select a user to start conversation</h3>
                  </li>
                )}
                </ul>
              </div>
            </section>

            {/* Message list*/}
            <aside className="hidden lg:block lg:flex-shrink-0 lg:order-first">
              <div className="h-full relative flex flex-col w-80 border-r border-gray-200 bg-gray-100">
                <div className="flex-shrink-0">
                  <div className="h-16 bg-white px-6 flex flex-col justify-center">
                    <div className="flex items-baseline space-x-3">
                      <h2 className="text-lg font-medium text-gray-900">Inbox</h2>
                      <p className="text-sm font-medium text-gray-500">{msgs.length} messages</p>
                    </div>
                  </div>
                  <div className="border-t border-b border-gray-200 bg-gray-50 px-6 py-2 text-sm font-medium text-gray-500">
                    Sorted by date
                  </div>
                </div>
                <div aria-label="Message list" className="min-h-0 flex-1 overflow-y-auto">
                  <ul role="list" className="">
                    {users.map((user) => (
                      <User
                        key={user.uid}
                        user={user}
                        selectUser={selectUser}
                        user1={user1}
                        chat={chat}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </>
  );
};

export default Home;

