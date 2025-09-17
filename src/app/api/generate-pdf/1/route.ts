import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd get this data from the request body
    const body = await request.json();
    const dummyData = {
      caseYear: body.caseYear || "2025",
      caseNumber: body.caseNumber || "12345",
      itemNumber: body.itemNumber || "1",
      submissionYear: body.submissionYear || "2025",
      submissionMonth: body.submissionMonth || "09",
      submissionDay: body.submissionDay || "16",
      mainApplicantName: body.mainApplicantName || "김철수",
      additionalApplicantsCount: body.additionalApplicantsCount || "4",
    };

    // 1. Read the HTML template from the file system
    const templatePath = path.join(process.cwd(), 'public/templates', 'report-template.html');
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
        'Content-Disposition': `attachment; filename="joint-bidding-report.pdf"`,
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