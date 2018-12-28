import firebase from "firebase/app";
import "firebase/firestore";

const settings = { timestampsInSnapshots: true };
const config = {
  apiKey: "AIzaSyDIJiOPJOpTtmVrTlOVhEh7mzUx2Zz8lYg",
  authDomain: "vuejs-with-firestore-sample.firebaseapp.com",
  databaseURL: "https://vuejs-with-firestore-sample.firebaseio.com",
  projectId: "vuejs-with-firestore-sample",
  storageBucket: "vuejs-with-firestore-sample.appspot.com",
  messagingSenderId: "128475229007"
};

firebase.initializeApp(config);
firebase.firestore().settings(settings);

export default firebase;