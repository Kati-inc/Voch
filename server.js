import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const WAITLIST_FILE = path.join(__dirname, "waitlist.json");

// Ensure waitlist.json exists
if (!fs.existsSync(WAITLIST_FILE)) {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify([]));
}

app.post("/api/waitlist", (req, res) => {
    const { email } = req.body;

    // Validate email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
    }

    try {
        // Read existing waitlist
        const data = JSON.parse(fs.readFileSync(WAITLIST_FILE, "utf8"));

        // Check if email already exists
        if (data.includes(email)) {
            return res.status(400).json({ error: "Email already on waitlist" });
        }

        // Add new email
        data.push(email);

        // Write back to file
        fs.writeFileSync(WAITLIST_FILE, JSON.stringify(data, null, 2));

        res.json({ success: true, message: `Email ${email} added to waitlist` });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`✓ Waitlist server running on http://localhost:${PORT}`);
});
