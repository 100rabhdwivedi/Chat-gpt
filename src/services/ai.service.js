const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function main(payLoad) {
    const chatCompletion = await getGroqChatCompletion(payLoad);
    console.log(payLoad);
    
    // Print the completion returned by the LLM.
    return chatCompletion.choices[0]?.message?.content || "";
}

async function getGroqChatCompletion(payLoad) {
    return groq.chat.completions.create({
        messages: payLoad,
        model: "openai/gpt-oss-20b",
    });
}

module.exports = main