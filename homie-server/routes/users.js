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
  try {
    const collection = await db.collection("User");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) {
      return res.status(404).json({ error: "User not found" }); // Correct way to return 404
    }

    res.status(200).json(result); // Correct way to send success response
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" }); // Handles unexpected errors
  }
});

//update user name, username, bio
router.patch("/:id", async (req, res) => {
  let collection = await db.collection("User");

  const { name, username, bio } = req.body;

  // const name = `${firstName} ${lastName}`;

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

//update the image field of user
router.patch("/:id/image", async (req, res) => {
  let collection = await db.collection("User");

  const { image } = req.body;

  if (!image) {
    return res.status(400).send("Image field is required");
  }

  const updateData = {
    image,
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
    console.error("Error updating user image:", err);
    res.status(500).send("Internal Server Error");
  }
});


router.patch("/:id/role", async (req, res) => {
  let collection = await db.collection("User");

  const { role } = req.body;

  if (!role || !['USER', 'ADMIN'].includes(role)) {
    return res.status(400).send("Valid role (USER or ADMIN) is required");
  }

  try {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.updateOne(query, {
      $set: { role },
    });

    if (result.modifiedCount === 0) {
      res.status(404).send("User not found or no changes made");
    } else {
      const updatedUser = await collection.findOne(query);
      res.status(200).json(updatedUser);
    }
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).send("Internal Server Error");
  }
});

// api used to update the hashedPasswordField
router.patch("/:id/passwordChange", async (req, res) => {
  let collection = await db.collection("User");

  const { hashedPassword } = req.body;

  if (!hashedPassword) {
    return res.status(400).send("hashedPassword field is required");
  }

  try {
    const query = { _id: new ObjectId(req.params.id) };
    const user = await collection.findOne(query);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const updateData = { hashedPassword };

    const result = await collection.updateOne(query, {
      $set: updateData,
    });

    if (result.modifiedCount === 0) {
      return res.status(400).send("Password update failed or no changes made");
    }

    res.status(200).send("Password updated successfully");
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).send("Internal Server Error");
  }
});
//api to delete a user
router.delete("/:id", async (req, res) => {
    let collection = await db.collection("User");
    const userId = req.params.id;
    const query = { _id: new ObjectId(userId) };
    try {
        // 1. Get user's yaps before deletion
        const userToDelete = await collection.findOne(query);
        if (!userToDelete) {
            return res.status(404).send("User not found");
        }

        // 2. Remove yaps containing this user from other users' yaps arrays
        await collection.updateMany(
            { "yaps.participants": userId },
            { $pull: { yaps: { participants: userId } } }
        );

        // 3. Remove user from others' homies arrays
        await collection.updateMany(
            { homies: userId },
            { $pull: { homies: userId } }
        );

        // 4. Finally delete the user
        const result = await collection.deleteOne(query);
        
        if (result.deletedCount === 0) {
            res.status(404).send("User not found");
        } else {
            res.status(200).send("User and related data deleted successfully");
        }
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).send("Internal Server Error");
    }
});


export default router;