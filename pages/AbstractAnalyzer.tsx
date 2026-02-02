import React, { useState, useRef } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { Search, Loader2, Check, X, AlertTriangle, FileText, Upload, FileType } from 'lucide-react';

export const AbstractAnalyzer: React.FC = () => {
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
      setAbstract(''); // Clear text input if file is selected
      setError(null);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data url prefix
            const base64 = result.split(',')[1]; 
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!abstract.trim() && !file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing in environment.");
      }
      
      let inputData: any = {};
      
      if (file) {
        const base64 = await readFileAsBase64(file);
        inputData = { fileData: base64, mimeType: file.type };
      } else {
        inputData = { text: abstract };
      }

      const data = await analyzeDocument(inputData);
      setResult(data);
    } catch (err: any) {
       console.error(err);
       setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
             <div className="bg-[#002F6C] p-2 rounded-full text-white">
                <FileText size={20} />
             </div>
             <h2 className="text-2xl font-bold text-[#002F6C] font-serif">Document Scanner</h2>
        </div>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          Upload a full clinical trial PDF or paste the abstract text. The AI will extract the Trial Registration Number (TRN) 
          and identify prospective/retrospective indicators.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* File Upload Section */}
          <div 
            className={`border-2 border-dashed rounded p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative h-48 bg-slate-50 ${
              file ? 'border-[#002F6C] bg-blue-50' : 'border-slate-300 hover:border-[#002F6C]'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf" 
              onChange={handleFileChange}
            />
            
            {file ? (
              <>
                <FileType size={40} className="text-[#002F6C] mb-2" />
                <p className="font-bold text-[#002F6C] text-sm break-all px-2">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="mt-3 text-xs text-red-600 hover:underline font-bold uppercase"
                >
                  Remove PDF
                </button>
              </>
            ) : (
              <>
                <Upload size={32} className="text-slate-400 mb-2" />
                <p className="font-bold text-slate-700 text-sm">Upload Paper (PDF)</p>
                <p className="text-xs text-slate-500 mt-1">Click to browse files</p>
              </>
            )}
            
            {/* Overlay if text is present to indicate mutual exclusivity */}
            {abstract && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-sm rounded">
                <span className="text-xs font-bold text-slate-500 uppercase">Text Input Active</span>
              </div>
            )}
          </div>

          {/* Text Input Section */}
          <div className="relative h-48">
            <textarea
              className={`w-full h-full p-4 border rounded focus:ring-1 focus:ring-[#002F6C] focus:border-[#002F6C] transition-all resize-none font-serif text-sm leading-relaxed text-slate-700 ${
                 file ? 'bg-slate-100 text-slate-400' : 'bg-white border-slate-300'
              }`}
              placeholder="Or paste abstract text here..."
              value={abstract}
              onChange={(e) => {
                setAbstract(e.target.value);
                if (e.target.value) clearFile();
              }}
              disabled={!!file}
            ></textarea>
            {file && (
               <div className="absolute inset-0 z-10 flex items-center justify-center">
                 <span className="text-xs font-bold text-slate-500 uppercase bg-white/80 px-2 py-1 rounded">PDF Upload Active</span>
               </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => {
                clearFile();
                setAbstract("Objectives To evaluate the compliance with prospective registration. Methods We searched PubMed for RCTs registered in 2018. Results Trial NCT01234567 was registered on Jan 1, 2018. Participants were enrolled starting Feb 1, 2018. Conclusions High compliance observed.");
            }}
            className="text-sm text-[#002F6C] hover:underline font-bold"
          >
            Load Sample Text
          </button>
          
          <button
            onClick={handleAnalyze}
            disabled={loading || (!abstract && !file)}
            className={`flex items-center space-x-2 px-8 py-3 rounded font-bold text-white transition-all uppercase tracking-wide text-xs ${
              loading || (!abstract && !file)
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-[#002F6C] hover:bg-[#001d42] shadow-sm'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            <span>{loading ? 'Analyzing...' : 'Analyze Document'}</span>
          </button>
        </div>

        {error && (
            <div className="mt-6 p-4 bg-red-50 text-[#D10000] rounded border border-red-100 flex items-start space-x-3">
                <AlertTriangle className="shrink-0" size={20} />
                <span className="font-medium text-sm">{error}</span>
            </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 font-serif">Analysis Results</h3>
            <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-1 rounded text-slate-500 uppercase">AI Generated</span>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">TRN Detection</h4>
                <div className="flex items-center space-x-3">
                  {result.hasTRN ? (
                    <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 px-4 py-3 rounded border border-emerald-100 w-full">
                      <Check size={18} />
                      <span className="font-bold font-mono text-lg">{result.trn}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-[#D10000] bg-red-50 px-4 py-3 rounded border border-red-100 w-full">
                      <X size={18} />
                      <span className="font-bold">No TRN Found</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Timeline Indicators</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="text-sm text-slate-700 font-medium">Enrollment Date Mentioned</span>
                        {result.enrollmentMentioned ? <Check size={18} className="text-emerald-600"/> : <X size={18} className="text-slate-300"/>}
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="text-sm text-slate-700 font-medium">Registration Date Mentioned</span>
                        {result.registrationMentioned ? <Check size={18} className="text-emerald-600"/> : <X size={18} className="text-slate-300"/>}
                    </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
               <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Extracted Dates</h4>
                {result.extractedDates && result.extractedDates.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-slate-700 space-y-2 font-serif bg-slate-50 p-4 rounded border border-slate-100">
                        {result.extractedDates.map((d: string, i: number) => <li key={i}>{d}</li>)}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-400 italic">No specific dates extracted.</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">AI Assessment</h4>
                <div className="p-4 bg-blue-50 text-blue-900 rounded text-sm leading-relaxed border border-blue-100 font-serif italic">
                    "{result.analysis}"
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
