const {GoogleGenAI}= require("@google/genai")

const ai = new GoogleGenAI({});

async function main(payLoad) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: payLoad,
    });
    return response.text;
}

module.exports ={main}