// CHANGED: wszystko działa lokalnie, bez wysyłania danych
const chatLogs = [];
let lastBotTimestamp = null;

// Wstaw tutaj swój klucz API do OpenAI
const OPENAI_API_KEY = "";

async function sendMessage() {
    const participantId = document.getElementById('participant-id').value.trim();
    if (!participantId) {
        alert("Wprowadź ID uczestnika przed rozpoczęciem rozmowy.");
        return;
    }

    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;

    const selectedTone = document.querySelector('input[name="tone"]:checked').value;

    const now = new Date();
    let reactionTime = null;
    if (lastBotTimestamp) {
        reactionTime = (now - lastBotTimestamp) / 1000;
    }

    document.getElementById('chat-box').innerHTML += `<p><strong>Ty:</strong> ${userInput}</p>`;

    const answerPools = {
        "życzliwy": [
            "Dziękuję, to bardzo ciekawe spostrzeżenie!",
            "Cieszę się, że o tym wspominasz!",
            "To brzmi naprawdę inspirująco!",
            "Masz rację, to ważny temat.",
            "Dziękuję, że się tym podzieliłeś!"
        ],
        "profesjonalny": [
            "Dziękuję za informację.",
            "To trafne spostrzeżenie z perspektywy analizy danych.",
            "Czy mógłbyś doprecyzować swoją wypowiedź?",
            "Zgadzam się, że to istotny aspekt problemu.",
            "Niestety, nie posiadam wystarczających danych, by odpowiedzieć precyzyjnie."
        ],
        "swobodny": [
            "Haha, dobre pytanie!",
            "O, to brzmi ciekawie!",
            "Serio? To brzmi całkiem zabawnie.",
            "No jasne, zgadzam się z Tobą.",
            "Nie mam pojęcia, ale brzmi nieźle!"
        ]
    };

    const poolText = answerPools[selectedTone].map((a, i) => `${i + 1}. ${a}`).join('\n');

    const toneInstruction = {
        "życzliwy": "Odpowiadaj w sposób ciepły, empatyczny i przyjazny.",
        "profesjonalny": "Odpowiadaj formalnie, rzeczowo i precyzyjnie.",
        "swobodny": "Odpowiadaj w sposób luźny, naturalny i nieformalny."
    }[selectedTone];

    const systemPrompt = `Jesteś chatbotem eksperymentalnym. ${toneInstruction}
Możesz odpowiadać wyłącznie, wybierając jedną z poniższych odpowiedzi:
${poolText}
Nie wymyślaj nowych odpowiedzi, nie podawaj numerów.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                temperature: 0,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userInput }
                ]
            })
        });

        const data = await response.json();
        const botMessage = data.choices[0].message.content.trim();

        document.getElementById('chat-box').innerHTML += `<p><strong>Bot (${selectedTone}):</strong> ${botMessage}</p>`;
        document.getElementById('user-input').value = '';

        chatLogs.push({
            participantId: participantId,
            tone: selectedTone,
            timestamp: now.toISOString(),
            user: userInput,
            bot: botMessage,
            reactionTime: reactionTime !== null ? reactionTime.toFixed(2) : ""
        });

        lastBotTimestamp = new Date();
    } catch (err) {
        console.error("Błąd API:", err);
        alert("Wystąpił błąd w komunikacji z chatbotem.");
    }
}

// ADDED: przycisk do podglądu logów w konsoli
function showLogs() {
    console.log("=== Chat Logs ===");
    chatLogs.forEach((log, index) => {
        console.log(`#${index + 1}`, log);
    });
    if (chatLogs.length === 0) console.log("Brak wiadomości do wyświetlenia.");
}

// Obsługa Entera
document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
