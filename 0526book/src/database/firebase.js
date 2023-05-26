// 인증을 위한 getAuth 가져옴
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH,
    projectId: "sql-test-5ed2b",
    storageBucket: "sql-test-5ed2b.appspot.com",
    messagingSenderId: "779091367579",
    appId: "1:779091367579:web:e99e68567011185edf183e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// 사용하고자 하는 서비스를 들고 와서 사용
// 인증서비스에 관한 내용 들고와 사용
export const auth = getAuth(app);
export const db = getFirestore(app);