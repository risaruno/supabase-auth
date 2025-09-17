"use client";

import { useState } from 'react';

export default function GenerateReportPdfPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePdf = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-pdf/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // In a real app, you would send form data here
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      // Handle the file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'joint-bidding-report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">공동입찰신고서 생성</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">문서 정보</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>사건번호:</strong> 2025타경12345호
          </div>
          <div>
            <strong>물건번호:</strong> 1
          </div>
          <div>
            <strong>신청인:</strong> 김철수 외 4인
          </div>
          <div>
            <strong>신청일:</strong> 2025년 09월 16일
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-600">
            공동입찰자 목록은 별지에 기재된 바와 같습니다.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">안내사항</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 공동입찰을 하는 때에는 입찰표에 각자의 지분을 분명하게 표시하여야 합니다.</li>
          <li>• 별지 공동입찰자 목록과 사이에 공동입찰자 전원이 간인하십시오.</li>
        </ul>
      </div>

      <button 
        onClick={handleGeneratePdf} 
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            생성 중...
          </span>
        ) : (
          '공동입찰신고서 PDF 생성 및 다운로드'
        )}
      </button>

      <div className="mt-6 text-sm text-gray-500">
        <p>* 이 문서는 샘플 데이터로 생성됩니다.</p>
        <p>* 실제 사용 시에는 정확한 사건 정보를 입력해주세요.</p>
      </div>
    </div>
  );
}