import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the POST request
    const formData = await request.formData();
    
    // Convert FormData to URLSearchParams for easier handling
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      params.append(key, value.toString());
    });

    // Get the host and protocol from headers
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Create the callback URL for the parent window
    const authUrl = new URL('/auth', baseUrl);
    authUrl.search = params.toString();

    // Return an HTML page that will close the popup and redirect the parent
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>인증 완료</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loading"></div>
          <p>인증이 완료되었습니다. 창을 닫는 중...</p>
        </div>
        
        <script>
          try {
            // Check if this window was opened as a popup
            if (window.opener) {
              // Redirect the parent window to show results
              window.opener.location.href = '${authUrl.toString()}';
              // Close this popup window
              window.close();
            } else {
              // If not a popup, redirect normally
              window.location.href = '${authUrl.toString()}';
            }
          } catch (error) {
            console.error('Error handling callback:', error);
            // Fallback: redirect this window
            window.location.href = '${authUrl.toString()}';
          }
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Error processing authentication result:', error);
    
    // Fallback HTML for errors
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>인증 오류</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .error {
            color: #e74c3c;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p class="error">인증 처리 중 오류가 발생했습니다.</p>
          <button onclick="closeWindow()">창 닫기</button>
        </div>
        
        <script>
          function closeWindow() {
            if (window.opener) {
              window.opener.location.href = '/auth?error=processing_failed';
              window.close();
            } else {
              window.location.href = '/auth?error=processing_failed';
            }
          }
          
          // Auto close after 3 seconds
          setTimeout(closeWindow, 3000);
        </script>
      </body>
      </html>
    `;

    return new Response(errorHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Handle GET requests by redirecting to auth page with query params
    const url = new URL(request.url);
    
    // Get the host and protocol from headers or the URL
    const host = request.headers.get('host') || url.host;
    const protocol = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
    const baseUrl = `${protocol}://${host}`;
    
    const authUrl = new URL('/auth', baseUrl);
    
    // Copy all query parameters
    url.searchParams.forEach((value, key) => {
      authUrl.searchParams.set(key, value);
    });
    
    // Similar HTML response for GET requests
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>인증 완료</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loading"></div>
          <p>인증이 완료되었습니다. 창을 닫는 중...</p>
        </div>
        
        <script>
          try {
            if (window.opener) {
              window.opener.location.href = '${authUrl.toString()}';
              window.close();
            } else {
              window.location.href = '${authUrl.toString()}';
            }
          } catch (error) {
            console.error('Error handling callback:', error);
            window.location.href = '${authUrl.toString()}';
          }
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
    
  } catch (error) {
    console.error('Error processing GET authentication result:', error);
    
    // Fallback redirect
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/auth?error=processing_failed'
      }
    });
  }
}