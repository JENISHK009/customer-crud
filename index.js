import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import {
    customerRoutes,
    orderRoutes,
    productRoutes,
    paymentRotes,
    reportRoutes,
    userRoutes
} from "./src/routes/index.js";
import { initializeConnections } from "./src/config/index.js";
import { updatePointEverySec } from "./src/utils/index.js";
import { blockIps, rateLimiter } from "./src/middlewares/index.js";
const app = express();
dotenv.config();

async function startServer() {
    await initializeConnections();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());

    app.use(rateLimiter);
    app.use(blockIps);

    app.use("/customer", customerRoutes);
    app.use("/order", orderRoutes);
    app.use("/product", productRoutes);
    app.use("/payment", paymentRotes);
    app.use("/report", reportRoutes);
    app.use("/user", userRoutes);


    updatePointEverySec.start();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("Error starting server:", error);
});
