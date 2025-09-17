import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request) {
  try {
    // In a real app, you'd get this data from the request body
    const body = await request.json();
    const dummyData = {
      biddingYear: body.biddingYear || "2025",
      biddingMonth: body.biddingMonth || "09",
      biddingDay: body.biddingDay || "16",
      caseYear: body.caseYear || "2025",
      caseNumber: body.caseNumber || "12345",
      itemNumber: body.itemNumber || "1",
      bidderName: body.bidderName || "김철수",
      bidderAddress: body.bidderAddress || "서울특별시 강남구 테헤란로 123, 456호",
      bidderId: body.bidderId || "850101-1234567",
      bidderPhone: body.bidderPhone || "010-1234-5678",
      corporateRegistrationNumber: body.corporateRegistrationNumber || "",
      agentName: body.agentName || "이영희",
      agentId: body.agentId || "870202-2345678",
      agentPhone: body.agentPhone || "010-9876-5432",
      agentAddress: body.agentAddress || "서울특별시 서초구 서초대로 456, 789호",
      relationshipWithBidder: body.relationshipWithBidder || "배우자",
      
      // Bid price digits (example: 123,456,789 won)
      bidPrice_100B: body.bidPrice_100B || "",
      bidPrice_10B: body.bidPrice_10B || "",
      bidPrice_1B: body.bidPrice_1B || "1",
      bidPrice_100M: body.bidPrice_100M || "2",
      bidPrice_10M: body.bidPrice_10M || "3",
      bidPrice_1M: body.bidPrice_1M || "4",
      bidPrice_100K: body.bidPrice_100K || "5",
      bidPrice_10K: body.bidPrice_10K || "6",
      bidPrice_1K: body.bidPrice_1K || "7",
      bidPrice_100: body.bidPrice_100 || "8",
      bidPrice_10: body.bidPrice_10 || "9",
      bidPrice_1: body.bidPrice_1 || "0",
      
      // Guarantee amount digits (example: 12,345,678 won - typically 10% of bid price)
      guaranteeAmount_10B: body.guaranteeAmount_10B || "",
      guaranteeAmount_1B: body.guaranteeAmount_1B || "",
      guaranteeAmount_100M: body.guaranteeAmount_100M || "1",
      guaranteeAmount_10M: body.guaranteeAmount_10M || "2",
      guaranteeAmount_1M: body.guaranteeAmount_1M || "3",
      guaranteeAmount_100K: body.guaranteeAmount_100K || "4",
      guaranteeAmount_10K: body.guaranteeAmount_10K || "5",
      guaranteeAmount_1K: body.guaranteeAmount_1K || "6",
      guaranteeAmount_100: body.guaranteeAmount_100 || "7",
      guaranteeAmount_10: body.guaranteeAmount_10 || "8",
      guaranteeAmount_1: body.guaranteeAmount_1 || "0",
      
      cashCheck: body.cashCheck || "✔",  // Checked by default
      guaranteeCheck: body.guaranteeCheck || "",
      
      // Second page (위임장) data
      agentOccupation: body.agentOccupation || "변호사",
      
      // person 1 data
      person1Name: body.person1Name || "김홍길",
      person1Id: body.person1Id || "800101-1234567",
      person1Phone: body.person1Phone || "010-1111-2222",
      person1Address: body.person1Address || "서울특별시 강남구 강남대로 100, 101호",
      person1Occupation: body.person1Occupation || "회사원",
      
      // person 2 data
      person2Name: body.person2Name || "박영수",
      person2Id: body.person2Id || "750505-2345678",
      person2Phone: body.person2Phone || "010-3333-4444",
      person2Address: body.person2Address || "서울특별시 서초구 서초중앙로 200, 202호",
      person2Occupation: body.person2Occupation || "자영업",
      
      // person 3 data
      person3Name: body.person3Name || "이미나",
      person3Id: body.person3Id || "880303-3456789",
      person3Phone: body.person3Phone || "010-5555-6666",
      person3Address: body.person3Address || "서울특별시 종로구 종로 300, 303호",
      person3Occupation: body.person3Occupation || "교사",
    };

    // 1. Read both HTML templates from the file system
    const template1Path = path.join(process.cwd(), 'public/templates', 'application-template.html');
    const template2Path = path.join(process.cwd(), 'public/templates', 'application2-template.html');
    
    let html1 = await fs.readFile(template1Path, 'utf-8');
    let html2 = await fs.readFile(template2Path, 'utf-8');

    // 2. Populate both templates with dynamic data
    for (const [key, value] of Object.entries(dummyData)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html1 = html1.replace(regex, value);
      html2 = html2.replace(regex, value);
    }

    // 3. Launch Puppeteer and create a PDF
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Set a longer timeout
      page.setDefaultNavigationTimeout(30000);
      
      // Create first page - use a simple approach
      await page.setContent(html1, { waitUntil: 'domcontentloaded' });
      // await page.waitForTimeout(1000); // Wait for fonts to load
      const page1Buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      // Create second page
      await page.setContent(html2, { waitUntil: 'domcontentloaded' });
      // await page.waitForTimeout(1000); // Wait for fonts to load
      const page2Buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      // 4. Merge both PDFs using pdf-lib
      const mergedPdf = await PDFDocument.create();
      
      // Add first page
      const pdf1 = await PDFDocument.load(page1Buffer);
      const pages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
      pages1.forEach((page) => mergedPdf.addPage(page));
      
      // Add second page
      const pdf2 = await PDFDocument.load(page2Buffer);
      const pages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
      pages2.forEach((page) => mergedPdf.addPage(page));

      // Generate final PDF buffer
      const finalPdfBuffer = await mergedPdf.save();

      // 5. Send the generated PDF back to the client
      return new NextResponse(Buffer.from(finalPdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="bidding-application-with-authorization.pdf"`,
        },
      });
      
    } finally {
      // Always close the browser
      await browser.close();
    }

  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}