import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpYNCF62T1C_NgeCPIxjPfMYOPW1gmx30",
  authDomain: "agri-65800.firebaseapp.com",
  projectId: "agri-65800",
  storageBucket: "agri-65800.firebasestorage.app",
  messagingSenderId: "352642218983",
  appId: "1:352642218983:web:8fd93e07bb847d1fd05b42",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence);

export { app, auth, db };
