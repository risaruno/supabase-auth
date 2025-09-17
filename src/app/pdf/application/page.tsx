"use client";

import { useState } from 'react';

export default function GenerateBiddingApplicationPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePdf = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-pdf/application', {
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
      a.download = 'bidding-application.pdf';
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
      <h1 className="text-3xl font-bold mb-6">기일입찰표 생성</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">입찰 정보</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>입찰기일:</strong> 2025년 09월 16일
          </div>
          <div>
            <strong>사건번호:</strong> 2025타경12345호
          </div>
          <div>
            <strong>입찰자:</strong> 김철수
          </div>
          <div>
            <strong>물건번호:</strong> 1
          </div>
          <div>
            <strong>주소:</strong> 서울특별시 강남구 테헤란로 123, 456호
          </div>
          <div>
            <strong>보증방법:</strong> 현금·자기앞수표
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2">주의사항 요약</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 입찰표는 물건마다 별도의 용지를 사용하십시오</li>
          <li>• 입찰가격은 수정할 수 없으므로 신중하게 작성하십시오</li>
          <li>• 신분확인상 주민등록증을 꼭 지참하십시오</li>
          <li>• 대리인 입찰 시 위임장과 인감증명을 제출하십시오</li>
          <li>• 공동입찰 시 공동입찰신고서를 함께 제출하십시오</li>
        </ul>
      </div>

      <div className="bg-red-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-red-800 mb-2">법적 고지</h3>
        <p className="text-sm text-red-700">
          일단 제출된 입찰표는 취소, 변경이나 교환이 불가능합니다. 
          모든 정보를 정확히 확인한 후 제출하시기 바랍니다.
        </p>
      </div>

      <button 
        onClick={handleGeneratePdf} 
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
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
          '기일입찰표 PDF 생성 및 다운로드'
        )}
      </button>

      <div className="mt-6 text-sm text-gray-500">
        <p>* 이 문서는 샘플 데이터로 생성됩니다.</p>
        <p>* 실제 사용 시에는 정확한 입찰 정보를 입력해주세요.</p>
        <p>* 모든 주의사항을 숙지한 후 사용하시기 바랍니다.</p>
      </div>
    </div>
  );
}