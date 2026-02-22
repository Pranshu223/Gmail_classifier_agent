import { oauth2Client } from "../config/googleClient.js";
import { fetchAndClassify } from "../services/gmail.service.js";

export const googleAuth = (req, res) => {
    console.log("Google auth route hit");
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"]
  });

  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const classified = await fetchAndClassify(oauth2Client);

    res.json({
      success: true,
      data: classified
    });

  } catch (err) {
    console.error("ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message || err
    });
  }
};
