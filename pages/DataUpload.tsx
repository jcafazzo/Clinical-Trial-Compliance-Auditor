import React from 'react';
import { UploadCloud, FileSpreadsheet, RefreshCcw } from 'lucide-react';

interface DataUploadProps {
  onReset: () => void;
}

export const DataUpload: React.FC<DataUploadProps> = ({ onReset }) => {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 mt-12">
      <div className="bg-white p-12 rounded shadow-sm border border-slate-200 border-dashed">
        <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-50 rounded-full text-[#002F6C]">
                <UploadCloud size={48} strokeWidth={1.5} />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-[#002F6C] mb-2 font-serif">Upload Study Data</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Upload a CSV file containing your study data to perform the compliance analysis.
          <br/><span className="text-xs text-slate-400 italic">(Feature simulated for this demo)</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#002F6C] text-white rounded hover:bg-[#001d42] transition-colors font-bold text-sm uppercase tracking-wide">
                <FileSpreadsheet size={18} />
                <span>Select CSV File</span>
            </button>
            <button 
                onClick={onReset}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors font-bold text-sm uppercase tracking-wide"
            >
                <RefreshCcw size={18} />
                <span>Load Sample Dataset</span>
            </button>
        </div>
      </div>

      <div className="text-left bg-slate-50 p-6 rounded border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-2 font-serif">Required CSV Format</h3>
        <p className="text-sm text-slate-600 mb-4">Ensure your dataset includes the following columns for accurate analysis:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 font-mono">
            <li>• Journal Name</li>
            <li>• Publication Date</li>
            <li>• ICMJE Member (True/False)</li>
            <li>• Trial Registration Number</li>
            <li>• Enrollment Date (YYYY-MM-DD)</li>
            <li>• Registration Date (YYYY-MM-DD)</li>
        </ul>
      </div>
    </div>
  );
};