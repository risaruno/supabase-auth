"use client";

import { useState } from 'react';

export default function GeneratePdfPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePdf = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-pdf/3', {
        method: 'POST',
        // In a real app, you would send your form data in the body
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ ...yourFormData }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      // Handle the file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gongdong-report.pdf';
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
    <div>
      <h1>Generate Joint Bidding Report</h1>
      <p>Click the button below to generate a sample PDF using pre-filled data.</p>
      <button onClick={handleGeneratePdf} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate and Download PDF'}
      </button>
    </div>
  );
}