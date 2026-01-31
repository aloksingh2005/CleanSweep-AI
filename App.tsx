import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ImageUploader } from './components/ImageUploader';
import { Editor } from './components/Editor';
import { ProcessingView } from './components/ProcessingView';
import { ComparisonView } from './components/ComparisonView';
import { AppState, AppMode, ProcessedResult } from './types';
// We swap the import to use our new Computer Vision service
import { processWithOpenCV } from './services/openCVService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setOriginalImage(e.target.result as string);
        setAppState(AppState.EDITOR);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async (
    mode: AppMode,
    maskData?: string,
    promptOverride?: string
  ) => {
    if (!originalImage) return;

    setIsProcessing(true);
    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      // Logic Update: We now strictly require a mask for OpenCV
      // The Editor component generates the mask data URL (the red strokes on transparent bg)
      if (mode === AppMode.TEXT_REMOVAL && !maskData) {
         throw new Error("For offline mode, please use the Object Remover brush to highlight text manually.");
      }

      const resultImage = await processWithOpenCV(
        originalImage, 
        maskData || null,
        mode
      );

      setProcessedResult({
        original: originalImage,
        processed: resultImage,
        timestamp: Date.now()
      });
      setAppState(AppState.COMPARE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during processing.");
      setAppState(AppState.EDITOR);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedResult(null);
    setAppState(AppState.UPLOAD);
    setError(null);
  };

  const handleBackToEditor = () => {
    setAppState(AppState.EDITOR);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)]">
        {appState === AppState.UPLOAD && (
          <ImageUploader onUpload={handleImageUpload} />
        )}

        {appState === AppState.EDITOR && originalImage && (
          <Editor 
            imageSrc={originalImage} 
            onProcess={handleProcess}
            error={error}
          />
        )}

        {appState === AppState.PROCESSING && (
          <ProcessingView />
        )}

        {appState === AppState.COMPARE && processedResult && (
          <ComparisonView 
            result={processedResult} 
            onReset={handleReset}
            onBack={handleBackToEditor}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;