import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get yaps for a specific user
router.get("/:userId/yaps", async (req, res) => {
    const { userId } = req.params;
    let collection = await db.collection("User");
  
    try {
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      if (!user) return res.status(404).send("User not found");
  
      // Return 'yaps' or an empty array if no yaps are found
      res.status(200).json(user.yaps || []);
    } catch (err) {
      console.error("Error fetching yaps:", err);
      res.status(500).send("Internal Server Error");
    }
});

// Add a new yap for a user (affect both participants)
router.post("/:userId/add-yap", async (req, res) => {
    const { userId } = req.params;
    const { yapId, participants } = req.body;
  
    if (!yapId || !participants || !Array.isArray(participants)) {
      return res.status(400).send("Invalid yap data.");
    }
  
    let collection = await db.collection("User");
  
    try {
      const senderId = participants[0]; // First participant (sender)
      const receiverId = participants[1]; // Second participant (receiver)
  
      // First, check if the sender exists and has the 'yaps' array
      const sender = await collection.findOne({ _id: new ObjectId(senderId) });
      if (!sender) {
        return res.status(404).send("Sender not found.");
      }
  
      // Explicitly create 'yaps' array if it doesn't exist for the sender
      if (!sender.yaps) {
        await collection.updateOne(
          { _id: new ObjectId(senderId) },
          { $set: { yaps: [] } }
        );
      }
  
      // Similarly, check if the receiver exists and has the 'yaps' array
      const receiver = await collection.findOne({ _id: new ObjectId(receiverId) });
      if (!receiver) {
        return res.status(404).send("Receiver not found.");
      }
  
      // Explicitly create 'yaps' array if it doesn't exist for the receiver
      if (!receiver.yaps) {
        await collection.updateOne(
          { _id: new ObjectId(receiverId) },
          { $set: { yaps: [] } }
        );
      }
  
      // Now update both sender and receiver documents
      const senderUpdate = collection.updateOne(
        { _id: new ObjectId(senderId) },
        {
          $addToSet: {
            yaps: {
              yapId,
              participants,
              lastMessage: "",
              lastMessageTime: null,
              unreadCount: 0,
              lastSenderId: senderId,
              status: "sent",
            },
          },
        }
      );
  
      const receiverUpdate = collection.updateOne(
        { _id: new ObjectId(receiverId) },
        {
          $addToSet: {
            yaps: {
              yapId,
              participants,
              lastMessage: "",
              lastMessageTime: null,
              unreadCount: 0,
              lastSenderId: senderId,
              status: "sent",
            },
          },
        }
      );
  
      // Execute both updates concurrently
      await Promise.all([senderUpdate, receiverUpdate]);
  
      res.status(200).send("Yap added successfully.");
    } catch (err) {
      console.error("Error adding yap:", err);
      res.status(500).send("Internal Server Error");
    }
});
  
// Delete a specific yap for both participants
router.delete("/:userId/delete-yap/:yapId", async (req, res) => {
    const { userId, yapId } = req.params;
    let collection = await db.collection("User");
  
    try {
      const updateOperations = [
        collection.updateOne(
          { _id: new ObjectId(userId) },
          { $pull: { yaps: { yapId } } }
        ),
        collection.updateOne(
          { _id: new ObjectId(userId === req.params.userId ? req.body.participantId : userId) },
          { $pull: { yaps: { yapId } } }
        ),
      ];
  
      await Promise.all(updateOperations);
      res.status(200).send("Yap deleted successfully.");
    } catch (err) {
      console.error("Error deleting yap:", err);
      res.status(500).send("Internal Server Error");
    }
});
  
// Update a specific yap for both users
router.put("/:userId/update-yap/:yapId", async (req, res) => {
    const { userId, yapId } = req.params;
    const { lastMessage, lastMessageTime, lastSenderId, status, participants } = req.body;
  
    let collection = await db.collection("User");
  
    try {
      const updateOperations = participants
        .filter((participant) => ObjectId.isValid(participant)) // Ensure valid ObjectId
        .map((participant) =>
          collection.updateOne(
            { _id: new ObjectId(participant), "yaps.yapId": yapId },
            {
              $set: {
                "yaps.$.lastMessage": lastMessage,
                "yaps.$.lastMessageTime": new Date(lastMessageTime),
                "yaps.$.lastSenderId": lastSenderId,
                "yaps.$.status": status,
              },
              $inc: { "yaps.$.unreadCount": 1 }, // Increment unread count
            }
          )
        );
  
      await Promise.all(updateOperations);
      res.status(200).send("Yap updated successfully.");
    } catch (err) {
      console.error("Error updating yap:", err);
      res.status(500).send("Internal Server Error");
    }
});

// Mark a specific yap as read for both participants
router.put("/:userId/read-yap/:yapId", async (req, res) => {
    const { userId, yapId } = req.params;
    let collection = await db.collection("User");
  
    try {
      const updateOperations = [
        collection.updateOne(
          { _id: new ObjectId(userId), "yaps.yapId": yapId },
          {
            $set: { "yaps.$.unreadCount": 0, "yaps.$.status": "read" },
          }
        ),
        collection.updateOne(
          { _id: new ObjectId(userId === req.params.userId ? req.body.participantId : userId) },
          {
            $set: { "yaps.$.unreadCount": 0, "yaps.$.status": "read" },
          }
        ),
      ];
  
      await Promise.all(updateOperations);
      res.status(200).send("Yap marked as read.");
    } catch (err) {
      console.error("Error marking yap as read:", err);
      res.status(500).send("Internal Server Error");
    }
});
  

export default router;
