// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyBqYL2zKT45vQFPbkOycdnILE_a8sUow",
  authDomain: "chat-app-c360c.firebaseapp.com",
  projectId: "chat-app-c360c",
  storageBucket: "chat-app-c360c.appspot.com",
  messagingSenderId: "911343565754",
  appId: "1:911343565754:web:7966892f42eb13f6ccfb83",
  measurementId: "G-9DWJHMM327"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);