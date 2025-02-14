import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This section will help you get a list of all the records.
router.get("/", async (req, res) => {
  let collection = await db.collection("User");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection("User");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

router.patch("/:id", async (req, res) => {
  let collection = await db.collection("User");

  const { firstName, lastName, username, bio } = req.body;

  const name = `${firstName} ${lastName}`;

  const updateData = {
    name,
    username,
    bio
  };

  try {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.updateOne(query, {
      $set: updateData,
    });

    if (result.modifiedCount === 0) {
      res.status(404).send("User not found or no changes made");
    } else {
      const updatedUser = await collection.findOne(query);
      res.status(200).json(updatedUser);
    }
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  let collection = await db.collection("User");

  const query = { _id: new ObjectId(req.params.id) };

  try {
    const result = await collection.deleteOne(query);
    if (result.deletedCount === 0) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send("User deleted successfully");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Internal Server Error");
  }
});


export default router;