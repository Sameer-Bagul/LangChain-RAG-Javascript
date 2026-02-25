# Chapter 3: Basic Chat Interaction

This step demonstrates how to actually use the initialized LLM to generate a response.

## Objects and Classes

- **Asynchronous Methods (`async/await`)**: We modify `initChatModel` to be `async`. Since talking to an LLM takes time (it is an I/O operation), we must use `await` to prevent the code from moving forward before the answer is ready.
- **The `invoke` Method**: Every LangChain model object has an `invoke` method. This is the standard way to send a string (the prompt) to the model and receive a string (the response) back.

## Architectural Background

This is the "Request-Response" cycle. 
1. The application sends a string to the Ollama server (running on port 11434 by default).
2. The Node.js event loop pauses the execution of this specific function (via `await`).
3. The LLM processes the tokens and generates an answer.
4. The result is returned to our application and stored in the `response` variable.

## Code Implementation

```javascript
import { Ollama } from "@langchain/ollama";

class PdfQA {

  constructor({ model }) {
    this.model = model;
  }

  init(){
    this.initChatModel();
    return this;
  }

  async initChatModel(){
    console.log("Loading model...");
    this.llm = new Ollama({ model: this.model });
    
    // Using invoke() to send a natural language query
    const response = await this.llm.invoke("What is the capital of Zimbabwe?");
    console.log(response);
  }

}

const pdfQa = new PdfQA({ model: "llama3" }).init();
```
