const {GoogleGenAI}= require("@google/genai")

const ai = new GoogleGenAI({});

async function main(payLoad) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: payLoad,
    });
    return response.text;
}

async function generateVector(payLoad) {


    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: payLoad,
        config:{
            outputDimensionality:1024
        }
    });

    return response.embeddings[0].values
}

module.exports ={main,generateVector}