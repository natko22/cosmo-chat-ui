import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, push, onValue } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBLiQzIYxJlWVC-U3jungOyg6HFh_pU6gE",
  authDomain: "cosmo-chat-634bc.firebaseapp.com",
  databaseURL:
    "https://cosmo-chat-634bc-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "cosmo-chat-634bc",
  storageBucket: "cosmo-chat-634bc.appspot.com",
  messagingSenderId: "46897193688",
  appId: "1:46897193688:web:5d44b6ce3ee9608f96adad",
  measurementId: "G-2MMM35MWK1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };
export const saveMessage = async (sessionId, message) => {
  const messageListRef = ref(database, `sessions/${sessionId}/chats`);
  const newMessageRef = push(messageListRef);
  console.log(`Saving message to session: ${sessionId}`, message); // Debug log
  await set(newMessageRef, message);
};

export const fetchMessages = (sessionId, setMessages) => {
  const messageListRef = ref(database, `sessions/${sessionId}/chats`);
  console.log(`Fetching messages for session: ${sessionId}`); // Debug log
  onValue(messageListRef, (snapshot) => {
    const data = snapshot.val();
    setMessages(data ? Object.values(data) : []);
    console.log(`Messages fetched for session: ${sessionId}`, data); // Debug log
  });
};

export const endChatSession = async (sessionId, chatMessages) => {
  const sessionRef = ref(database, `sessions/${sessionId}`);
  console.log(`Ending session: ${sessionId}`, chatMessages); // Debug log
  await set(sessionRef, {
    date: new Date().toISOString(),
    chats: chatMessages,
  });
};
