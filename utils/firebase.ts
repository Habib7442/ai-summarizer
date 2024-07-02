import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  updateDoc,
  FieldValue,
  arrayUnion,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  initializeAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { toast } from "sonner";

const firebaseConfig = {
  apiKey: "AIzaSyC2u4oRWeiD7DQzDp9PhjmlQtAIXZVfP4c",
  authDomain: "silken-dogfish-425903-h6.firebaseapp.com",
  databaseURL: "https://silken-dogfish-425903-h6-default-rtdb.firebaseio.com",
  projectId: "silken-dogfish-425903-h6",
  storageBucket: "silken-dogfish-425903-h6.appspot.com",
  messagingSenderId: "769462926678",
  appId: "1:769462926678:web:4f555635771453e40baaf7",
  measurementId: "G-35V8W3NSZR",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
const storage = getStorage(app);

const auth = getAuth();

interface UserSignUp {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface Chat {
  id: string;
  userId: string;
  messages: any;
  articleUrl: string;
  articleSummary: string;
}

interface ChatData {
  userId: string;
  articleUrl: string;
  summary: string;
  messages: any;
  updatedAt: FieldValue;
  createdAt?: FieldValue; // Optional field
}

const signUpWithEmailPassword = async ({
  firstName,
  lastName,
  email,
  password,
}: UserSignUp) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // Store additional user info in Firestore
    await sendEmailVerification(user);
    toast(
      "A verification email has been sent to your registered email address. Please verify your email to complete the sign-up process."
    );
    // Correct the Firestore path
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      firstName,
      lastName,
      email,
      credit: 10,
      createdAt: serverTimestamp(),
    });
    console.log("User created with email and password:", user);
    return user;
  } catch (error) {
    console.error("Error signing up with email and password:", error);
    throw error; // Propagate the error to the caller
  }
};

const signInWithFirebase = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error("Email not verified");
    }

    console.log("User signed in with email and password:", user);
    return user;
  } catch (error) {
    console.error("Error signing in with email and password:", error);
    throw error; // Throw the error to be caught by the caller
  }
};

const forgotPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    toast("Password reset email sent. Please check your inbox.");
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    toast("Error sending password reset email. Please try again.");
    throw error;
  }
};
const saveChat = async (
  userId: string,
  articleUrl: string,
  articleSummary: string,
  newMessages: any[],
  chatId: string | null = null
) => {
  let chatRef;
  let existingMessages = [];

  if (chatId) {
    chatRef = doc(db, "summarize", chatId);
    const chatDoc = await getDoc(chatRef);
    if (chatDoc.exists()) {
      existingMessages = chatDoc.data().messages;
    }
  } else {
    chatRef = doc(collection(db, "summarize"));
  }

  const updatedMessages = [...existingMessages, ...newMessages];

  const chatData = {
    userId,
    articleUrl,
    articleSummary,
    messages: updatedMessages,
  };

  await setDoc(chatRef, chatData);

  return chatRef.id;
};

 const fetchChatsByUser = async (userId: string): Promise<any[]> => {
  const chatsRef = collection(db, "summarize");
  const q = query(chatsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

const deleteChat = async (chatId: string) => {
  try {
    const chatRef = doc(db, "summarize", chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error("Error deleting chat: ", error);
    throw error;
  }
};

// const chatwithgemini = async ({ prompt }) => {
//   console.log(prompt);
//   try {
//     const vertexAI = new VertexAI({
//       project: process.env.NEXT_PUBLIC_PROJECT_ID,
//       location: "us-central1",
//     });

//     const generativeModel = vertexAI.getGenerativeModel({
//       model: "gemini-1.5-flash-001",
//     });
//     const result = await generativeModel.generateContent(prompt);

//     const response = await result.response;
//     const text = JSON.stringify(response);
//     console.log(text);
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//     throw error;
//   }
// };

export {
  db,
  storage,
  signUpWithEmailPassword,
  signInWithFirebase,
  forgotPassword,
  saveChat,
  fetchChatsByUser,
  auth,
  deleteChat,
  // chatwithgemini,
};
export default app;
