
import React from 'react';
import { ExternalLink, FileText, Download } from 'lucide-react';

const DOCUMENTS = [
  { label: 'Resume', path: '/resume/resume.pdf' },
];

const ResumeApp: React.FC = () => {
  return (
    <div className="h-full bg-white flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        {DOCUMENTS.map((doc) => (
          <div key={doc.label} className="flex flex-col items-center gap-3">
            <FileText size={48} className="text-purple-300" />
            <span className="pixel-font text-2xl font-bold text-purple-900 uppercase">{doc.label}</span>
            <div className="flex items-center gap-3">
              <a
                href={doc.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600 rounded-xl transition-all border-2 border-purple-100 font-bold text-sm"
                title={`Open ${doc.label} in new tab`}
              >
                <ExternalLink size={16} />
                Open
              </a>
              <a
                href={doc.path}
                download
                className="flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-500 hover:text-white text-pink-500 rounded-xl transition-all border-2 border-pink-100 font-bold text-sm"
                title={`Download ${doc.label}`}
              >
                <Download size={16} />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeApp;
