
import React from 'react';
import { ExternalLink, FileText, Download } from 'lucide-react';

// 여기에 실제 PDF 파일의 경로를 입력하세요.
// 예: '/resume.pdf' 또는 'https://yourdomain.com/my-resume.pdf'
const PDF_URL = '/resume.pdf'; 

const ResumeApp: React.FC = () => {
  return (
    <div className="h-full bg-slate-100 flex flex-col overflow-hidden">
      {/* PDF 제어 상단바 (선택 사항) */}
      <div className="bg-white px-4 py-2 border-b border-purple-100 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2 text-purple-700">
          <FileText size={18} />
          <span className="font-bold text-sm uppercase tracking-tight">resume.pdf</span>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href={PDF_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600 rounded-lg text-xs font-bold transition-all border border-purple-100"
          >
            <ExternalLink size={14} />
            새 창에서 열기
          </a>
          <a 
            href={PDF_URL} 
            download
            className="p-1.5 bg-pink-50 hover:bg-pink-500 hover:text-white text-pink-500 rounded-lg transition-all border border-pink-100"
            title="Download PDF"
          >
            <Download size={14} />
          </a>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div className="flex-1 bg-slate-200 relative">
        <iframe
          src={`${PDF_URL}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-none"
          title="Resume PDF"
        />
        
        {/* PDF가 로드되지 않을 때를 위한 안내 (iframe 뒤에 배치) */}
        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
          <FileText size={48} className="mb-4 opacity-20" />
          <p className="font-bold text-sm mb-2">PDF를 불러오는 중이거나 뷰어를 지원하지 않는 브라우저입니다.</p>
          <p className="text-xs">상단의 '새 창에서 열기' 버튼을 클릭해 주세요.</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeApp;
