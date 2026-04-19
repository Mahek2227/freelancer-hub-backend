import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendNotification } from "./sendNotification.js";


export const notifyUser = async (userId, title, message) => {
  try {
    if (!userId) {
      console.log("❌ No userId provided");
      return;
    }

    await Notification.create({
      user: userId,   // ✅ correct user ID
      title,
      message,
    });

    const user = await User.findById(userId);

    if (user?.fcmToken) {
      await sendNotification(user.fcmToken, title, message);
    }
  } catch (error) {
    console.log("Notify error:", error);
  }
};