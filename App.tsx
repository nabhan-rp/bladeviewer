import React, { useState, useRef } from 'react';
import { analyzeBladeCode } from './services/geminiService';
import { DocumentState, LetterSettings, TabView } from './types';
import EditorPanel from './components/EditorPanel';
import TemplatePreview from './components/TemplatePreview';

const DEFAULT_SETTINGS: LetterSettings = {
  pageSize: 'A4',
  unit: 'cm',
  pageWidth: 21,
  pageHeight: 29.7,
  marginTop: 3, 
  marginRight: 2.5,
  marginBottom: 2.5,
  marginLeft: 3, 
  globalFontFamily: '"Times New Roman", serif',
  headerFontFamily: '"Times New Roman", serif',
  contentFontFamily: '"Times New Roman", serif',
  attachmentFontFamily: '"Times New Roman", serif',
  fontSize: 12,
  showKop: false,
  headerContent: '',
  headerLines: [],
  logoUrl: "", 
  logoAspectRatio: "1:1",
  rawHtmlContent: "<div class='text-center p-10 text-gray-400'>Upload a Blade File to see preview</div>",
  hasAttachment: false,
  attachmentShowKop: false,
  attachmentContent: "",
  showFooter: false,
  footerContent: "",
  variables: [],
  showSignature: false,
  signatureCity: "Jakarta",
  signatures: []
};

const App: React.FC = () => {
  const [docState, setDocState] = useState<DocumentState>({
    originalFileName: null,
    isAnalyzing: false,
    analysisError: null,
  });

  const [settings, setSettings] = useState<LetterSettings>(DEFAULT_SETTINGS);
  const [view, setView] = useState<TabView>(TabView.UPLOAD);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualCreate = () => {
    setSettings(DEFAULT_SETTINGS);
    setView(TabView.EDITOR);
  };

  const handleBackToUpload = () => {
    if (confirm("Go back to upload?")) {
      setView(TabView.UPLOAD);
      setDocState({ originalFileName: null, isAnalyzing: false, analysisError: null });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDocState(prev => ({ ...prev, isAnalyzing: true, analysisError: null, originalFileName: file.name }));

    try {
        const reader = new FileReader();
        const bladeText = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });

        const analysis = await analyzeBladeCode(bladeText);
        
        setSettings(prev => ({
          ...prev,
          rawHtmlContent: analysis.cleanHtml,
          variables: analysis.variables.map((v, i) => ({ ...v, id: `v-${i}` })),
          showKop: false, 
          showSignature: false,
        }));
        
        setView(TabView.EDITOR);

    } catch (err: any) {
        setDocState(prev => ({ 
            ...prev, 
            analysisError: `Parsing error: ${err.message}` 
        }));
    } finally {
        setDocState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleDownloadPreview = () => {
      // 1. Determine Smart Filename for PDF
      let fileName = "Dokumen";

      // Check if user has filled in specific key variables
      const meaningfulVars = ['nomor_surat', 'no_surat', 'title', 'judul', 'perihal', 'nama_dokumen'];
      const foundVar = settings.variables.find(v => 
        meaningfulVars.includes(v.key.toLowerCase()) && v.defaultValue.trim() !== ''
      );

      if (foundVar) {
          // Clean filename string
          fileName = foundVar.defaultValue.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();
      } else if (docState.originalFileName) {
          // Fallback to uploaded filename without extension
          fileName = docState.originalFileName.replace(/\.(blade\.php|php|txt|html)$/i, '');
      }

      // 2. Temporarily change document title (this is what browsers use for the Save as PDF filename)
      const originalTitle = document.title;
      document.title = fileName;

      // 3. Print
      window.print();

      // 4. Revert title after a small delay
      setTimeout(() => {
          document.title = originalTitle;
      }, 1000);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans">
      {(view === TabView.UPLOAD || view === TabView.EDITOR) && (
          <div className={`w-full lg:w-[420px] flex-shrink-0 h-full transition-all duration-300 no-print ${view === TabView.UPLOAD ? 'lg:w-full items-center justify-center' : ''}`}>
             {view === TabView.UPLOAD ? (
                 <div className="max-w-xl w-full p-10 bg-white rounded-3xl shadow-2xl text-center mx-4 border border-gray-100">
                    <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">BladeViewer</h1>
                    <p className="text-gray-500 mb-10 text-lg">Instant Local Blade Template Reader</p>
                    
                    {docState.analysisError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 mb-6 text-left">
                            <strong>Error:</strong> {docState.analysisError}
                        </div>
                    )}

                    <div className="flex flex-col gap-5">
                        <div className="relative group w-full">
                            <input type="file" accept=".php,.blade.php,.txt,.html" ref={fileInputRef} onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={docState.isAnalyzing} />
                            <div className={`w-full py-12 rounded-3xl border-3 border-dashed border-gray-200 bg-gray-50 group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-all flex flex-col items-center justify-center ${docState.isAnalyzing ? 'animate-pulse' : ''}`}>
                                <svg className="w-12 h-12 text-gray-300 mb-3 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                                <span className="text-gray-600 font-bold text-lg">
                                    {docState.isAnalyzing ? 'Parsing...' : 'Upload .blade.php file'}
                                </span>
                                <p className="text-gray-400 text-sm mt-1">Runs locally in your browser</p>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <button onClick={handleManualCreate} className="text-indigo-600 font-semibold hover:underline text-sm">
                                Or create from scratch
                            </button>
                        </div>
                    </div>
                 </div>
             ) : (
                 <EditorPanel 
                    settings={settings} 
                    setSettings={setSettings} 
                    onDownload={handleDownloadPreview} 
                    onBack={handleBackToUpload}
                 />
             )}
          </div>
      )}

      {view !== TabView.UPLOAD && (
        <div className={`flex-1 bg-gray-200 overflow-auto flex items-start justify-center p-8 lg:p-12 preview-container ${view === TabView.EDITOR ? 'hidden lg:flex' : ''}`}>
           <TemplatePreview settings={settings} />
        </div>
      )}
    </div>
  );
};

export default App;