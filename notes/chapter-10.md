# Chapter 10: Memory and Multilingual Support

A standard RAG chain is "stateless"—it forgets what was said as soon as the function finishes. This step introduces simple memory.

## Objects and Classes

- **`chat_history`**: This isn't a single class, but a pattern. We pass an array of previous messages back into the chain.
- **Multilingual Support**: LLMs like `llama3` are inherently multilingual. If the retrieved context is in English but the question is in German, the LLM will translate and reason across languages automatically.

## Architectural Background

The architecture moves from "Single Question" to "Conversational."
1. **Contextual awareness**: By passing `chat_history`, the LLM can resolve pronouns. For example, if you ask "How to install it?", the LLM knows "it" refers to "PyCharm" based on the previous message in the history.
2. **Retrieval in conversation**: In advanced setups (covered in later chapters), the history is also used to "re-phrase" the user's question to be more specific before searching the database.

## Code Implementation

```javascript
// Perform the first query
const answer1 = await pdfQaChain.invoke({ input: "What is PyCharm?" });

// Store the history as an array of [UserMessage, AssistantMessage]
const chatHistory = [ answer1.input, answer1.answer ];

// Ask a follow-up question using the history
const answer2 = await pdfQaChain.invoke({ 
  input: "How do I install it?", 
  chat_history: chatHistory 
});

console.log(answer2.answer);

// Testing multilingual support (Asking in German)
const answer3 = await pdfQaChain.invoke({ 
  input: "Wie fügt man einen benutzerdefinierten Dateityp hinzu?" 
});
console.log(answer3.answer);
```
