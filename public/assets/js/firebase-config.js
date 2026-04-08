// firebase-config.js — Shared Firebase configuration (single source of truth)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_G4hfiis6DjmPiwsh5-hnNKVztMfd_T4",
  authDomain: "booking-sw.firebaseapp.com",
  projectId: "booking-sw",
  storageBucket: "booking-sw.firebasestorage.app",
  messagingSenderId: "134246403096",
  appId: "1:134246403096:web:900da94277e8b70c4cc76d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
