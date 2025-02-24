import express from "express";
import cors from "cors";
import users from  "./routes/users.js";
import homies from "./routes/homies.js"
import yaps from "./routes/yaps.js"
import dotenv from 'dotenv'; 

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.get("/", (req, res) => {
  res.send("Homie Server");
})

app.use(cors());
app.use(express.json());
app.use("/users", users);
app.use("/homies", homies);
app.use("/yaps", yaps);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});