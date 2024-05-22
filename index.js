import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { customerRoutes } from "./src/routes/index.js";
import { initializeConnections } from "./src/config/index.js";

const app = express();
dotenv.config();

async function startServer() {
    await initializeConnections();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());

    app.use("/customer", customerRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("Error starting server:", error);
});
