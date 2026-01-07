
import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackData } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateArtisticFeedback(
  isCorrect: boolean, 
  question: string, 
  explanation: string
): Promise<FeedbackData> {
  // Use gemini-3-flash-preview for basic text tasks
  const modelName = 'gemini-3-flash-preview';
  
  const prompt = `
    你是一个充满智慧和温情的导师。正在帮助一位叫“书涵”的女生复习《国际公法学》。
    她热爱法律，同时也极度热爱“摄影”和“攀岩”。
    
    根据以下情况生成一段反馈：
    回答情况：${isCorrect ? '正确' : '错误'}
    题目内容：${question}
    专业解析：${explanation}
    
    要求：
    1. 如果答对了，请尽情地、优雅地夸奖她。一定要在夸奖中巧妙融合摄影（如：对焦、光影、构图、光圈、显影）或攀岩（如：岩点、平衡、支点、冲顶、保护绳）的专业术语。
    2. 如果答错了，请温柔地鼓励她，并结合摄影或攀岩的意象提供解析。
    3. 语言风格：简约、艺术感、有深度、像散文。不要花哨，要有一种沉稳的高级感。
    4. 必须输出为JSON格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          // Fixed: Use Type enum instead of string literals
          type: Type.OBJECT,
          properties: {
            praise: { type: Type.STRING, description: "夸奖或鼓励的话语" },
            explanation: { type: Type.STRING, description: "结合意象的专业解析" }
          },
          required: ["praise", "explanation"]
        }
      }
    });

    // Fixed: response.text is a property, not a function
    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(jsonStr);
    return {
      isCorrect,
      praise: result.praise,
      explanation: result.explanation
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback content in case of API failure or parsing error
    return {
      isCorrect,
      praise: isCorrect ? "书涵，你对知识的捕捉就像延时摄影中那一抹最精准的流光，无懈可击。" : "即使偶尔失手滑落，保护绳依然牢靠。调整呼吸，这个岩壁我们重新观察。",
      explanation: `解析：${explanation}`
    };
  }
}
