import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { ElevenLabsClient, stream } from 'elevenlabs';  // Import ElevenLabsClient

dotenv.config();

// Setup for __dirname in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Create the ElevenLabs client
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,  // Ensure this is in your .env file
});

const voiceId = process.env.VOICE_ID;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("audio"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route: Form page
app.get("/", (req, res) => {
  res.render("index", { audio: null });
});

// Route: Handle text submission and stream audio
app.post("/speak", async (req, res) => {
  const { text } = req.body;

  try {
    // Convert text to speech with ElevenLabs API
    const audioStream = await client.textToSpeech.convertAsStream(voiceId, {
      text: text,              // Text to convert to speech
      model_id: 'eleven_multilingual_v2',  // Specify your model ID
    });

    // Set response headers for streaming audio
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": "inline; filename=tts.mp3",
    });

    // Pipe the audio stream to the client
    audioStream.pipe(res);
    
  } catch (err) {
    console.error("Error during text-to-speech conversion:", err);
    res.status(500).send("Error streaming audio");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
