import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get all posts
router.get("/", async (req, res) => {
  let collection = await db.collection("Post");
  try {
    let results = await collection.find({}).toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Get a specific post by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  let collection = await db.collection("Post");
  
  try {
    const post = await collection.findOne({ _id: new ObjectId(id) });
    if (!post) return res.status(404).send("Post not found");
    res.status(200).json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Create a new post
router.post("/", async (req, res) => {
  const { title, content, userId, image, commentId } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).send("Title, content and userId are required");
  }

  const newPost = {
    title,
    content,
    userId: new ObjectId(userId),
    image,
    commentId,
    reactions: {
      dap: 0,
      love: 0,
      laugh: 0,
      angry: 0,
      cheeky: 0
    },
    isEdited: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  let collection = await db.collection("Post");
  
  try {
    const result = await collection.insertOne(newPost);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Update a post
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;
  
  const updateData = {
    ...(title && { title }),
    ...(content && { content }),
    ...(image && { image }),
    isEdited: true,
    updatedAt: new Date()
  };

  let collection = await db.collection("Post");

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send("Post not found");
    }

    res.status(200).json({ message: "Post updated successfully" });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let collection = await db.collection("Post");

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).send("Post not found");
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Update post reactions
router.patch("/:id/reactions", async (req, res) => {
  const { id } = req.params;
  const { reactions } = req.body;

  if (!reactions) {
    return res.status(400).send("Reactions data is required");
  }

  let collection = await db.collection("Post");

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { reactions, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send("Post not found");
    }

    res.status(200).json({ message: "Reactions updated successfully" });
  } catch (err) {
    console.error("Error updating reactions:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;