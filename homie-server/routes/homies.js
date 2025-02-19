import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

//api to get all the friend requests
router.get("/:userId/homie-requests", async (req, res) => {
    const { userId } = req.params;
  
    let collection = await db.collection("User");
  
    try {
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      if (!user) return res.status(404).send("User not found");
  
      res.status(200).json(user.homieRequests);
    } catch (err) {
      console.error("Error fetching homie requests:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  //api to get all the friends
  router.get("/:userId/homies", async (req, res) => {
    const { userId } = req.params;
  
    let collection = await db.collection("User");
  
    try {
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      if (!user) return res.status(404).send("User not found");
  
      res.status(200).json(user.homies);
    } catch (err) {
      console.error("Error fetching homies list:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  //api to send friend request
  router.post("/:userId/homie-request/:homieId", async (req, res) => {
    const { userId, homieId } = req.params;
  
    if (userId === homieId) {
      return res.status(400).send("You cannot send a homie request to yourself.");
    }
  
    let collection = await db.collection("User");
  
    try {
      // Check if the homie request already exists
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      if (!user) return res.status(404).send("User not found");
  
      if (user.homies.includes(homieId)) {
        return res.status(400).send("You are already homies.");
      }
  
      if (user.homieRequests.includes(homieId)) {
        return res.status(400).send("Homie request already sent.");
      }
  
      // Add homie request to the recipient's homieRequests list
      await collection.updateOne(
        { _id: new ObjectId(homieId) },
        { $addToSet: { homieRequests: userId } }
      );
  
      res.status(200).send("Homie request sent successfully.");
    } catch (err) {
      console.error("Error sending homie request:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  //api to accept friend request
  router.post("/:userId/accept-request/:homieId", async (req, res) => {
    const { userId, homieId } = req.params;
  
    if (userId === homieId) {
      return res.status(400).send("You cannot accept a homie request from yourself.");
    }
  
    let collection = await db.collection("User");
  
    try {
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      const homie = await collection.findOne({ _id: new ObjectId(homieId) });
  
      if (!user || !homie) return res.status(404).send("User or homie not found");
  
      // Check if the user has the homie request
      if (!user.homieRequests.includes(homieId)) {
        return res.status(400).send("No homie request found to accept.");
      }
  
      // Add both userId and homieId to each other's homies list
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { homies: homieId }, $pull: { homieRequests: homieId } }
      );
  
      await collection.updateOne(
        { _id: new ObjectId(homieId) },
        { $addToSet: { homies: userId }, $pull: { homieRequests: userId } }
      );
  
      res.status(200).send("Homie request accepted. You are now homies!");
    } catch (err) {
      console.error("Error accepting homie request:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  //api to reject friend request
  router.post("/:userId/reject-request/:homieId", async (req, res) => {
    const { userId, homieId } = req.params;
  
    if (userId === homieId) {
      return res.status(400).send("You cannot reject a homie request from yourself.");
    }
  
    let collection = await db.collection("User");
  
    try {
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      if (!user) return res.status(404).send("User not found");
  
      // Check if the user has a homie request from the given homieId
      if (!user.homieRequests.includes(homieId)) {
        return res.status(400).send("No homie request found to reject.");
      }
  
      // Remove the homie request from the user's homieRequests array
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { homieRequests: homieId } }
      );
  
      res.status(200).send("Homie request rejected.");
    } catch (err) {
      console.error("Error rejecting homie request:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  //api to remove friend
  router.delete("/:userId/remove-homie/:homieId", async (req, res) => {
    const { userId, homieId } = req.params;
  
    if (userId === homieId) {
      return res.status(400).send("You cannot remove yourself as a homie.");
    }
  
    let collection = await db.collection("User");
  
    try {
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      if (!user) return res.status(404).send("User not found");
  
      // Check if both users are homies
      if (!user.homies.includes(homieId)) {
        return res.status(400).send("Not homies with the given user.");
      }
  
      // Remove homie from both users' homies list
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { homies: homieId } }
      );
  
      await collection.updateOne(
        { _id: new ObjectId(homieId) },
        { $pull: { homies: userId } }
      );
  
      res.status(200).send("Homie removed successfully.");
    } catch (err) {
      console.error("Error removing homie:", err);
      res.status(500).send("Internal Server Error");
    }
});

export default router;