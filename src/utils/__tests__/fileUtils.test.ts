// src/utils/__tests__/fileUtils.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileContent } from '../fileUtils';

describe('readFileContent', () => {
  let originalFileReader: typeof globalThis.FileReader;

  beforeEach(() => {
    originalFileReader = globalThis.FileReader; // Store original before each test
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader; // Restore original after each test
    vi.restoreAllMocks(); // Clean up any spies or mocks
  });

  it('should successfully read file content as text', async () => {
    const mockFileContent = 'col1,col2\nval1,val2';
    // Create a File object with a Blob. Note: `File` constructor might need `FilePropertyBag` for the last arg.
    const mockFile = new File([new Blob([mockFileContent])], 'test.csv', { type: 'text/csv' });

    // Spy on FileReader methods to ensure they are called if needed for assertion
    const readAsTextSpy = vi.spyOn(FileReader.prototype, 'readAsText');

    const contentPromise = readFileContent(mockFile);
    await expect(contentPromise).resolves.toBe(mockFileContent);
    expect(readAsTextSpy).toHaveBeenCalledWith(mockFile);
  });

  it('should reject with an error if FileReader encounters an error', async () => {
    const mockFile = new File([new Blob(['error content'])], 'error.csv', { type: 'text/csv' });
    const mockError = new DOMException("Simulated Read Error");

    // Mock FileReader to simulate an error
    (globalThis.FileReader as any) = vi.fn(() => {
      let frInstance: any = {}; // Explicitly type as any or create a more complete mock
      frInstance.readAsText = vi.fn(function(this: FileReader) {
        // Simulate the onerror event by directly calling it
        if (frInstance.onerror) {
          // Assign the error object to the instance
          Object.defineProperty(frInstance, 'error', { get: () => mockError, configurable: true });
          frInstance.onerror(new ProgressEvent('error')); // Pass a ProgressEvent
        }
      });
      frInstance.onload = null; // Define all properties that might be accessed
      frInstance.onerror = null;
      return frInstance;
    });

    await expect(readFileContent(mockFile)).rejects.toThrow('File reading error occurred. See console for details.');
  });

  it('should successfully read an empty file as an empty string', async () => {
    const mockFile = new File([new Blob([''])], 'empty.csv', { type: 'text/csv' });
    await expect(readFileContent(mockFile)).resolves.toBe('');
  });
});