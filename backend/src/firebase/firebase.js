"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const firebaseConfig = {
    apiKey: "AIzaSyD0iZyzMT-SZC1KPmJxIQjBXg5kjWOKhME",
    authDomain: "ttt-webapp-unipi.firebaseapp.com",
    projectId: "ttt-webapp-unipi",
    storageBucket: "ttt-webapp-unipi.firebasestorage.app",
    messagingSenderId: "395315852092",
    appId: "1:395315852092:web:e4dbb16746b56816f7e439",
    measurementId: "G-F7V5FT5TC8"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const auth = (0, auth_1.getAuth)(app);
exports.auth = auth;
const db = (0, firestore_1.getFirestore)(app);
exports.db = db;
