//Import semua library yang dibutuhkan
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

//Direktori untuk file static
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Inisialisasi variable expres, cors, dan GoogleGenAI
const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//Inisialisasi variable untuk model yang akan digunakan
const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//Menjalankan server pada port 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Message must be an Array!');

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,

            //Parameter Gemini AI
            config: {
                temperature: 0.7,
                topP: 0.9,
                systemInstruction: `
                Kamu adalah seorang penuntut ilmu yang sedang berdiskusi tentang agama islam

                jawab dengan ringkas padat dan jelas
                jawab dalam format markdown
                jika ada pertanyaan diluar konteks atau tidak ada sumbernya jawab diluar konteks

                setiap jawaban tunjukkan dalil: hukum, kualitas haditsnya (shahih, hasan, dhaif), dan sumber webnya
                
                cari dari berbagai sumber web (misal: https://konsultasisyariah.com/2207-riba-haram.html),
                jika ada lebih dari 1 sumber web maka gunakan penomoran dengan format sitasi IEEE
                `
                //maxOutputTokens: 200
            }
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
