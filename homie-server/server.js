import express from "express";
import cors from "cors";


const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
// app.use('/record', records);

app.get("/api/home", (req, res) => {
    res.json({ message: "Hello World" });
});

app.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`);
});
