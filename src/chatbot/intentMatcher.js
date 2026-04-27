import { knowledgeBase } from "./knowledgeBase";

export const detectIntent = (message) => {
  const lowerMsg = message.toLowerCase();

  for (let item of knowledgeBase) {
    for (let keyword of item.keywords) {
      if (lowerMsg.includes(keyword)) {
        return item;
      }
    }
  }

  return null;
};