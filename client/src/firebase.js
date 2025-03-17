// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "homemate-998f4.firebaseapp.com",
  projectId: "homemate-998f4",
  storageBucket: "homemate-998f4.firebasestorage.app",
  messagingSenderId: "49233351074",
  appId: "1:49233351074:web:ba2126dfbdbc479a17a2fb"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

