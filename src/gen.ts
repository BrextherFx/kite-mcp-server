import { KiteConnect } from "kiteconnect";
import "dotenv/config";


const apiKey = process.env.KITE_API_KEY!;
const apiSecret = process.env.KITE_API_SECRET!;
const requestToken = process.env.KITE_REQUEST_TOKEN!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;

const kc = new KiteConnect({ api_key: apiKey });

console.log(kc.getLoginURL());

async function init() {
  try {
    kc.setAccessToken(accessToken);
    await generateSession();
    await getProfile();
  } catch (err) {
    console.error(err);
  }
}

async function generateSession() {
  try {
    const response = await kc.generateSession(requestToken, apiSecret);
    kc.setAccessToken(response.access_token);
    console.log("Session generated:", response);
  } catch (err) {
    console.error("Error generating session:", err);
  }
}

async function getProfile() {
  try {
    const profile = await kc.getProfile();
    console.log("Profile:", profile);
  } catch (err) {
    console.error("Error getting profile:", err);
  }
}
// Initialize the API calls
init();