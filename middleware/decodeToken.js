import admin from "../config/firebaseadmin.json"

export default async function decodeToken(token) {

    try {
        const decodeValue = await admin.auth().verifyIdToken(token);
       
        if (decodeValue) {
            return { authorized: true }
        }
        return { authorized: false }
    }
    catch (err) {
        return { authorized: false, err: err.message }
    }
}

