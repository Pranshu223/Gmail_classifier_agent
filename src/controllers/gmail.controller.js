import { fetchAndClassify } from "../services/gmail.service.js";
import { oauth2Client } from "../config/googleClient.js";

export const getClassifiedEmails = async(req,res)=>{
    try {
        const classifiedEmails = await fetchAndClassify(oauth2Client);
        const grouped = {};
        for(let email of classifiedEmails){
            const category = email.category;
            if(!grouped[category]){
                grouped[category]={
                    count: 0,
                    emails: []
                };
            }
            grouped[category].emails.push(email);
            grouped[category].count++;
        }
        res.json({
            success: true,
            data: grouped
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};