const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function main(content) {
    const chatCompletion = await getGroqChatCompletion(content);
    // Print the completion returned by the LLM.
    return chatCompletion.choices[0]?.message?.content || "";
}

async function getGroqChatCompletion(content) {
    return groq.chat.completions.create({
        messages: [{
            role: "user",
            content
        }, ],
        model: "openai/gpt-oss-20b",
    });
}

module.exports = main