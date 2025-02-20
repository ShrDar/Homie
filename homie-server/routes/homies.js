import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// api to get all the homie requests
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

// api to get all the homies
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

// api to send a homie request
router.post("/:userId/homie-request/:homieId", async (req, res) => {
  const { userId, homieId } = req.params;

  if (userId === homieId) {
    return res.status(400).send("You cannot send a homie request to yourself.");
  }

  let collection = await db.collection("User");

  try {
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).send("User not found");

    if (user.homies.includes(homieId)) {
      return res.status(400).send("You are already homies.");
    }

    if (user.homieRequests.includes(homieId)) {
      return res.status(400).send("Homie request already sent.");
    }

    if (user.homieSentRequests && user.homieSentRequests.includes(homieId)) {
      return res.status(400).send("You have already sent a request to this person.");
    }

    // Add homie request to recipient's homieRequests
    await collection.updateOne(
      { _id: new ObjectId(homieId) },
      { $addToSet: { homieRequests: userId } }
    );

    // Add this homieId to user's homieSentRequests
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { homieSentRequests: homieId } }
    );

    res.status(200).send("Homie request sent successfully.");
  } catch (err) {
    console.error("Error sending homie request:", err);
    res.status(500).send("Internal Server Error");
  }
});

// api to accept a homie request
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

    if (!user.homieRequests.includes(homieId)) {
      return res.status(400).send("No homie request found to accept.");
    }

    // Add homie to both users' homies list and remove from homieRequests
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { homies: homieId }, $pull: { homieRequests: homieId } }
    );
    
    await collection.updateOne(
      { _id: new ObjectId(homieId) },
      { $addToSet: { homies: userId }, $pull: { homieSentRequests: userId } }
    );
    
    res.status(200).send("Homie request accepted. You are now homies!");
  } catch (err) {
    console.error("Error accepting homie request:", err);
    res.status(500).send("Internal Server Error");
  }
});

// api to reject a homie request
router.post("/:userId/reject-request/:homieId", async (req, res) => {
  const { userId, homieId } = req.params;

  if (userId === homieId) {
    return res.status(400).send("You cannot reject a homie request from yourself.");
  }

  let collection = await db.collection("User");

  try {
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).send("User not found");

    if (!user.homieRequests.includes(homieId)) {
      return res.status(400).send("No homie request found to reject.");
    }

    // Remove homie request from both users' lists
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { homieRequests: homieId }, $pull: { homieSentRequests: homieId } }
    );

    await collection.updateOne(
      { _id: new ObjectId(homieId) },
      { $pull: { homieSentRequests: userId } }
    );

    res.status(200).send("Homie request rejected.");
  } catch (err) {
    console.error("Error rejecting homie request:", err);
    res.status(500).send("Internal Server Error");
  }
});

// api to remove a homie
router.delete("/:userId/remove-homie/:homieId", async (req, res) => {
  const { userId, homieId } = req.params;

  if (userId === homieId) {
    return res.status(400).send("You cannot remove yourself as a homie.");
  }

  let collection = await db.collection("User");

  try {
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).send("User not found");

    if (!user.homies.includes(homieId)) {
      return res.status(400).send("Not homies with the given user.");
    }

    // Remove homie from both users' homies list and from the homieSentRequests
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

// api to remove a homie sent request
router.delete("/:userId/remove-homie-sent-request/:homieId", async (req, res) => {
  const { userId, homieId } = req.params;

  if (userId === homieId) {
    return res.status(400).send("You cannot remove a homie request to yourself.");
  }

  let collection = await db.collection("User");

  try {
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).send("User not found");

    if (!user.homieSentRequests.includes(homieId)) {
      return res.status(400).send("No homie request found to remove.");
    }

    // Remove homieSentRequest from the user's list
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { homieSentRequests: homieId } }
    );

    res.status(200).send("Homie sent request removed.");
  } catch (err) {
    console.error("Error removing homie sent request:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
