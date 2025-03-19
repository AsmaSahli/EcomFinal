// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
    apiKey: "AIzaSyCZ84QjhXfhJCWJt52OF85KH8ArG6OcgK8",
    authDomain: "ecompfe-286a8.firebaseapp.com",
    projectId: "ecompfe-286a8",
    storageBucket: "ecompfe-286a8.firebasestorage.app",
    messagingSenderId: "936483331435",
    appId: "1:936483331435:web:3cd93dae38e63d14b3c02e",
    measurementId: "G-RSGKYKTWGT"
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, db ,auth};