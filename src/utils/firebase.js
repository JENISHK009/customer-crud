import admin from "firebase-admin";
import serviceAccount from "./firebaseServiceAccKey.json" assert { type: "json" };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const firebaseDb = admin.firestore();

export default firebaseDb;
