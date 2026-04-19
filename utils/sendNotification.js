import admin from "../config/firebaseAdmin.js";

export const sendNotification = async (token, title, body) => {
  if (!token) return;

  await admin.messaging().send({
    token,
    notification: {
      title,
      body,
    },
  });
};