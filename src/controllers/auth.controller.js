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
  const { code } = req.query;
  console.log("code is",code);
  const { tokens } = await oauth2Client.getToken(code);
  console.log("tokens",tokens);
  oauth2Client.setCredentials(tokens);

  const classified = await fetchAndClassify(oauth2Client);
  console.log("classified",classified);
  
  res.json({
    success: true,
    data: classified
  });
};
