import admin from "firebase-admin";

if (!process.env.GOOGLE_CREDENTIALS_JSON) {
  throw new Error("GOOGLE_CREDENTIALS_JSON is missing");
}

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

  // Fix newline issue
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

} catch (error) {
  console.error(error);
  throw new Error("Invalid GOOGLE_CREDENTIALS_JSON");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;