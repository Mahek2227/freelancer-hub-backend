import admin from "../config/firebaseAdmin.js";

export const sendNotification = async (token, title, body) => {
  if (!token) return;

  try {
    await admin.messaging().send({
      token,

      notification: {
        title,
        body,
      },

      // 🔥 THIS IS WHAT YOU WERE MISSING
      webpush: {
        notification: {
          title,
          body,
          icon: "/logo.png",
        },
      },
    });

    console.log("✅ Push sent");
  } catch (error) {
    console.log("❌ Push error:", error);
  }
};