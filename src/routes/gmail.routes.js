import express from "express";
import { getClassifiedEmails } from "../controllers/gmail.controller.js";
const router = express.Router();
router.get("/",getClassifiedEmails);
export default router;