import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd get this data from the request body
    // const body = await request.json();
    const dummyData = {
      caseYear: "2025",
      caseNumber: "12345",
      itemNumber: "1",
      submissionYear: "2025",
      submissionMonth: "09",
      submissionDay: "16",
      
      // Bidder 1
      bidder1Number: "1",
      bidder1Name: "김철수",
      bidder1Address: "서울특별시 강남구 테헤란로 123, 456호",
      bidder1Id: "850101-1234567",
      bidder1Phone: "010-1234-5678",
      bidder1Share: "30%",
      
      // Bidder 2
      bidder2Number: "2",
      bidder2Name: "이영희",
      bidder2Address: "서울특별시 서초구 반포대로 789, 101호",
      bidder2Id: "900215-2345678",
      bidder2Phone: "010-2345-6789",
      bidder2Share: "25%",
      
      // Bidder 3
      bidder3Number: "3",
      bidder3Name: "박민수",
      bidder3Address: "경기도 성남시 분당구 정자일로 456, 202호",
      bidder3Id: "780920-1111111",
      bidder3Phone: "010-3456-7890",
      bidder3Share: "20%",
      
      // Bidder 4
      bidder4Number: "4",
      bidder4Name: "최지은",
      bidder4Address: "인천광역시 연수구 송도국제대로 321, 303호",
      bidder4Id: "920510-2222222",
      bidder4Phone: "010-4567-8901",
      bidder4Share: "15%",
      
      // Bidder 5
      bidder5Number: "5",
      bidder5Name: "정우진",
      bidder5Address: "부산광역시 해운대구 마린시티2로 654, 1201호",
      bidder5Id: "880314-1333333",
      bidder5Phone: "010-5678-9012",
      bidder5Share: "10%",
      
      // Bidder 6 (empty)
      bidder6Number: "",
      bidder6Name: "",
      bidder6Address: "",
      bidder6Id: "",
      bidder6Phone: "",
      bidder6Share: "",
      
      // Bidder 7 (empty)
      bidder7Number: "",
      bidder7Name: "",
      bidder7Address: "",
      bidder7Id: "",
      bidder7Phone: "",
      bidder7Share: "",
      
      // Bidder 8 (empty)
      bidder8Number: "",
      bidder8Name: "",
      bidder8Address: "",
      bidder8Id: "",
      bidder8Phone: "",
      bidder8Share: "",
      
      // Bidder 9 (empty)
      bidder9Number: "",
      bidder9Name: "",
      bidder9Address: "",
      bidder9Id: "",
      bidder9Phone: "",
      bidder9Share: "",
      
      // Bidder 10 (empty)
      bidder10Number: "",
      bidder10Name: "",
      bidder10Address: "",
      bidder10Id: "",
      bidder10Phone: "",
      bidder10Share: "",
    };

    // 1. Read the HTML template from the file system
    const templatePath = path.join(process.cwd(), 'public/templates', 'gongdong-template.html');
    let html = await fs.readFile(templatePath, 'utf-8');

    // 2. Populate the template with dynamic data
    for (const [key, value] of Object.entries(dummyData)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    }

    // 3. Launch Puppeteer and create a PDF
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set the HTML content of the page
    // 'networkidle0' waits for all network connections to be idle, ensuring web fonts load
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate the PDF from the page content
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Important for including CSS background styles
    });

    // 4. Close the browser
    await browser.close();

    // 5. Send the generated PDF back to the client
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gongdong-report.pdf"`,
      },
    });

  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}