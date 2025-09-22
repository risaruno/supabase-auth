import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authRequestUrl, txId, mid } = body;

    // Validate the URL to ensure it's from Inicis
    if (!authRequestUrl || (!authRequestUrl.includes('kssa.inicis.com') && !authRequestUrl.includes('fcsa.inicis.com'))) {
      return NextResponse.json(
        { error: 'Invalid authentication URL' },
        { status: 400 }
      );
    }

    // Prepare the data as JSON (like the PHP version)
    const requestData = {
      mid: mid,
      txId: txId
    };

    const verificationResponse = await fetch(authRequestUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Auth-Proxy/1.0)',
      },
      body: JSON.stringify(requestData)
    });

    if (!verificationResponse.ok) {
      const errorText = await verificationResponse.text();
      console.error('Inicis API error:', errorText);
      
      // Try to parse as JSON to get structured error info
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { 
            error: 'Verification request failed', 
            details: errorText,
            resultCode: errorData.resultCode,
            resultMsg: errorData.resultMsg 
          },
          { status: verificationResponse.status }
        );
      } catch {
        // If not JSON, return raw error
        return NextResponse.json(
          { error: 'Verification request failed', details: errorText },
          { status: verificationResponse.status }
        );
      }
    }

    // Parse the response from Inicis
    const responseText = await verificationResponse.text();
    
    // Try to parse as JSON, if it fails, return the raw text
    try {
      const responseData = JSON.parse(responseText);
      return NextResponse.json(responseData);
    } catch {
      // If it's not JSON, it might be an error message or different format
      console.warn('Non-JSON response from Inicis:', responseText);
      return NextResponse.json({ 
        rawResponse: responseText,
        message: 'Received non-JSON response from authentication server'
      });
    }

  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}