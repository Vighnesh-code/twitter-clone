import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  const userId = req.user._id;

  try {
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.log(`Error in GetNotifications Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const deleteNotifications = async (req, res) => {
  const userId = req.user._id;

  try {
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notification Deleted Successfully" });
  } catch (error) {
    console.log(`Error in DeleteNotification Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
