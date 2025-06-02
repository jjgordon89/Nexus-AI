/**
 * Web Worker for document processing
 * 
 * This worker handles heavy document processing tasks off the main thread
 * to prevent UI freezes when processing large files.
 */

// Helper functions
function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // Note: We can't directly import pdfjs in the worker
  // This is a simplified implementation
  return new Promise((resolve, reject) => {
    // Notify the main thread we need PDF.js
    self.postMessage({ type: 'needPDFJS' });

    // Set up a listener for when PDF.js is available
    self.addEventListener('message', function pdfJSHandler(e) {
      if (e.data.type === 'pdfJSReady') {
        // This would be provided by the main thread
        const pdfjs = e.data.pdfjs;
        
        // Process the PDF
        pdfjs.getDocument({ data: buffer }).promise.then((pdf: any) => {
          const numPages = pdf.numPages;
          let text = '';
          
          const processPage = (pageNum: number) => {
            if (pageNum > numPages) {
              resolve(text);
              return;
            }
            
            pdf.getPage(pageNum).then((page: any) => {
              page.getTextContent().then((content: any) => {
                const pageText = content.items
                  .map((item: any) => item.str)
                  .join(' ');
                  
                text += `Page ${pageNum}:\n${pageText}\n\n`;
                
                // Update progress
                self.postMessage({ 
                  type: 'progress', 
                  progress: pageNum / numPages 
                });
                
                // Process next page
                processPage(pageNum + 1);
              });
            });
          };
          
          processPage(1);
        }).catch(reject);
        
        // Remove the listener
        self.removeEventListener('message', pdfJSHandler);
      }
    });
  });
}

function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  // Notify the main thread we need mammoth.js
  self.postMessage({ type: 'needMammoth' });

  return new Promise((resolve, reject) => {
    self.addEventListener('message', function mammothHandler(e) {
      if (e.data.type === 'mammothReady') {
        const mammoth = e.data.mammoth;
        
        mammoth.extractRawText({ arrayBuffer: buffer })
          .then((result: any) => {
            resolve(result.value);
          })
          .catch(reject);
        
        // Remove the listener
        self.removeEventListener('message', mammothHandler);
      }
    });
  });
}

function extractTextFromCSV(text: string): string {
  const rows = text.split('\n').map(row => row.split(','));
  const headers = rows[0] || [];
  
  let formattedContent = `CSV Data:\n\n`;
  formattedContent += headers.map(header => `| ${header.trim()} `).join('') + '|\n';
  formattedContent += headers.map(() => '| --- ').join('') + '|\n';
  
  const maxRows = Math.min(rows.length - 1, 100);
  for (let i = 1; i <= maxRows; i++) {
    if (rows[i].length > 0 && rows[i][0].trim() !== '') {
      formattedContent += rows[i].map(cell => `| ${cell.trim()} `).join('') + '|\n';
    }
  }
  
  return formattedContent;
}

function extractTextFromJSON(text: string): string {
  try {
    const json = JSON.parse(text);
    const formattedJson = JSON.stringify(json, null, 2);
    
    if (formattedJson.length > 10000) {
      const keys = Object.keys(json);
      let summary = `JSON Data (large file)\n\n`;
      
      if (Array.isArray(json)) {
        summary += `Array with ${json.length} items.\n\n`;
        
        if (json.length > 0) {
          summary += `Example items:\n\`\`\`json\n${JSON.stringify(json.slice(0, 3), null, 2)}\n`;
          if (json.length > 3) summary += "...\n";
          summary += `\`\`\`\n`;
        }
      } else {
        summary += `Object with ${keys.length} top-level keys: ${keys.join(', ')}\n\n`;
        
        const sampleData = {};
        keys.slice(0, 5).forEach(key => {
          sampleData[key] = json[key];
        });
        
        summary += `Sample data:\n\`\`\`json\n${JSON.stringify(sampleData, null, 2)}\n`;
        if (keys.length > 5) summary += "...\n";
        summary += `\`\`\`\n`;
      }
      
      return summary;
    }
    
    return `JSON Data:\n\n\`\`\`json\n${formattedJson}\n\`\`\``;
  } catch (e) {
    return `Invalid JSON data:\n\n${text}`;
  }
}

// Main message handler
self.addEventListener('message', async (e) => {
  try {
    const { file, type, buffer } = e.data;
    
    // Send progress update
    self.postMessage({ type: 'progress', progress: 0.1 });
    
    let result = '';
    
    switch (type) {
      case 'text':
      case 'markdown':
        result = await new TextDecoder().decode(buffer);
        break;
        
      case 'pdf':
        result = await extractTextFromPDF(buffer);
        break;
        
      case 'docx':
        result = await extractTextFromDocx(buffer);
        break;
        
      case 'csv':
        const csvText = await new TextDecoder().decode(buffer);
        result = extractTextFromCSV(csvText);
        break;
        
      case 'json':
        const jsonText = await new TextDecoder().decode(buffer);
        result = extractTextFromJSON(jsonText);
        break;
        
      default:
        throw new Error(`Unsupported file type: ${type}`);
    }
    
    // Send result back to main thread
    self.postMessage({ 
      type: 'complete', 
      result,
      file: file.name
    });
    
  } catch (error) {
    // Send error back to main thread
    self.postMessage({ 
      type: 'error', 
      error: error.message || 'Unknown error processing file'
    });
  }
});