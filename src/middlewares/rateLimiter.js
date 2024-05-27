import rateLimit, { MemoryStore } from "express-rate-limit";
import { blockedIps } from "./ipBlocker.js";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

const rateLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: MAX_REQUESTS_PER_WINDOW,
    message: {
        success: false,
        message: "Too many requests, please try again later",
    },
    store: new MemoryStore({ max: 100 }),
    handler: function (req, res, next) {
        const { ip } = req;
        blockedIps.add(ip);
        console.log(`IP ${ip} added to blocked list for exceeding rate limit`);
        next();
    }
});

export default rateLimiter;
