import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const filePath = path.resolve("./config/serviceAccountKey.json");

let serviceAccount;

try {
  serviceAccount = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  );

  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

} catch (error) {
  console.error(error); // 👈 ADD THIS
  throw new Error("Error reading serviceAccountKey.json");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;