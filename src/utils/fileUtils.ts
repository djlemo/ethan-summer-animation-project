// src/utils/fileUtils.ts
export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      // In case of an error, reader.error will contain the DOMException
      console.error("FileReader error:", reader.error);
      reject(new Error('File reading error occurred. See console for details.'));
    };
    reader.readAsText(file);
  });
};