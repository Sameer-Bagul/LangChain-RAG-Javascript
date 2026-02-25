# Chapter 5: Document Splitting (Chunking)

LLMs have a limited "context window," which means they can't process a huge document all at once. We must break the text into smaller, manageable chunks.

## Objects and Classes

- **CharacterTextSplitter**: This class handles the logic of dividing long strings into smaller segments.
- **`chunkSize`**: Defines the maximum number of characters in each chunk.
- **`chunkOverlap`**: Defines how many characters from the end of one chunk should be repeated at the start of the next. This ensures that semantic context (like a sentence being cut in half) is not lost.

## Architectural Background

This is the "Pre-processing" stage. 
1. We take the `Document` objects from the loader.
2. The `CharacterTextSplitter` iterates through the text and cuts it based on a character (like a space or newline).
3. The result is a new, larger array of smaller `Document` objects (chunks). This is necessary because it allows us to retrieve only the *relevant* parts of a document later, saving space and improving accuracy.

## Code Implementation

```javascript
import { CharacterTextSplitter } from "@langchain/textsplitters";

class PdfQA {

  constructor({ model, pdfDocument, chunkSize, chunkOverlap }) {
    this.model        = model;
    this.pdfDocument  = pdfDocument;
    this.chunkSize    = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  async init(){
    await this.loadDocuments();
    await this.splitDocuments();
    return this;
  }

  async splitDocuments(){
    console.log("Splitting documents...");
    // Initialize the splitter with our parameters
    const textSplitter = new CharacterTextSplitter({ 
      separator: " ",
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap 
    });
    
    // Store the split chunks in this.texts
    this.texts = await textSplitter.splitDocuments(this.documents);
  }

}

const pdfQa = await new PdfQA({ 
  model: "llama3", 
  pdfDocument: "../materials/pycharm-documentation-mini.pdf",
  chunkSize: 1000,
  chunkOverlap: 0 
}).init();

console.log("Total text chunks created: ", pdfQa.texts.length);
```
