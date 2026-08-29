const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializácia AI – kľúč sa číta automaticky zo servera (nastavíš ho v premenných hostingu)
const ai = new GoogleGenAI();
const rooms = {};

// Endpoint pre AI generovanie otázok (žiaden používateľ nič nezadáva)
app.post('/api/generate-quiz', async (req, res) => {
    try {
        const { text, count } = req.body;
        if (!text) return res.status(400).json({ error: 'Chýba text.' });

        const prompt = `Na základe tohto textu vytvor presne ${count} kvalitných testových otázok s výberom z 4 možností (A, B, C, D) v slovenskom jazyku.
Text:
${text}

Vráť výsledok výhradne vo formáte čistého JSON pola (žiadny iný text, žiadne markdown bloky), presne v tejto štruktúre:
[
  {
    "question": "Znenie otázky?",
    "options": ["Možnosť A", "Možnosť B", "Možnosť C", "Možnosť D"],
    "correct": 0
  }
]
Kde "correct" je index správnej možnosti (0 až 3).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let rawText = response.text.trim();
        rawText = rawText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

        res.json({ questions: JSON.parse(rawText) });
    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ error: 'Chyba pri generovaní otázok cez AI.' });
    }
});

// Správa miestností a reálnych pripojení cez internet
io.on('connection', (socket) => {
    socket.on('create_room', ({ questions }) => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        rooms[pin] = { hostId: socket.id, questions, players: [], currentQ: -1, started: false };
        socket.join(pin);
        socket.emit('room_created', { pin });
    });

    socket.on('join_room', ({ pin, nickname }) => {
        const room = rooms[pin];
        if (!room) return socket.emit('error_msg', 'Miestnosť neexistuje.');
        if (room.started) return socket.emit('error_msg', 'Hra už začala.');

        socket.join(pin);
        room.players.push({ id: socket.id, nickname, score: 0 });
        io.to(room.hostId).emit('update_players', room.players);
        socket.emit('joined_ok', { nickname });
    });

    socket.on('next_question', (pin) => {
        const room = rooms[pin];
        if (!room || room.hostId !== socket.id) return;

        room.started = true;
        room.currentQ++;

        if (room.currentQ < room.questions.length) {
            const q = room.questions[room.currentQ];
            io.to(pin).emit('new_question', {
                index: room.currentQ,
                total: room.questions.length,
                question: q.question,
                options: q.options
            });
        } else {
            io.to(pin).emit('game_over', room.players);
        }
    });

    socket.on('submit_answer', ({ pin, answerIndex }) => {
        const room = rooms[pin];
        if (!room) return;
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        const q = room.questions[room.currentQ];
        const isCorrect = (answerIndex === q.correct);

        if (isCorrect) player.score += 100;

        socket.emit('answer_result', { isCorrect, correct: q.correct });
        io.to(room.hostId).emit('update_players', room.players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server beží na porte ${PORT}`));