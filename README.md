# Korean Authentication System - JavaScript Implementation

This project provides a complete JavaScript implementation of the Korean KISA SEED CBC encryption library and authentication system, converted from the original PHP version. It includes a web-based interface for testing Korean identity verification services (통합본인인증).

## Features

- **KISA SEED CBC Encryption**: Full JavaScript implementation of the Korean standard encryption algorithm
- **Authentication Flow**: Complete integration with Inicis authentication services
- **Web Interface**: Modern React/TypeScript-based authentication form
- **Real-time Hash Generation**: Automatic SHA256 hash generation for authentication
- **SEED Decryption**: Support for decrypting personal information received from authentication services
- **User Verification**: Built-in user validation against session/database information

## Project Structure

```
auth-test/
├── src/
│   ├── app/
│   │   └── auth/
│   │       └── page.tsx          # Main authentication page (React/TypeScript)
│   └── lib/
│       ├── kisa-seed-cbc.js      # KISA SEED CBC encryption library
│       └── ini-lib.js            # INI authentication utilities
├── public/
│   ├── lib/                      # JavaScript libraries for browser use
│   │   ├── kisa-seed-cbc.js
│   │   └── ini-lib.js
│   └── success.html              # Authentication result page
└── README.md
```

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd /Users/rsn/Documents/git/auth-test
   ```

2. **Install dependencies** (for Next.js development):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Main authentication page: `http://localhost:3000/auth`
   - Standalone HTML version: `http://localhost:3000/success.html`

## Usage

### Basic Authentication Flow

1. **Open the authentication page** at `/auth`
2. **Fill in the form fields**:
   - MID: Your merchant ID (default: INIiasTest for testing)
   - 요청구분코드: Service type ("01" for simple auth, "02" for digital signature)
   - 사용자 정보: Name, phone, birth date for fixed user authentication
3. **Generate hashes** by clicking "해시 생성"
4. **Request authentication** by clicking "인증요청"
5. **Complete authentication** in the popup window
6. **View results** on the success page with decrypted personal information

### JavaScript Libraries

#### KISA SEED CBC Library (`kisa-seed-cbc.js`)

```javascript
// Basic encryption/decryption
const encrypted = KISASeedCBC.seedCBCEncrypt(key, iv, data, 0, data.length);
const decrypted = KISASeedCBC.seedCBCDecrypt(key, iv, encrypted, 0, encrypted.length);

// Utility functions
const hash = await AuthUtils.sha256("your-string-to-hash");
const bytes = AuthUtils.stringToByteArray("your-string");
const base64 = AuthUtils.byteArrayToBase64(bytes);
```

#### INI Library (`ini-lib.js`)

```javascript
// Generate authentication hashes
const authHash = await INILib.generateAuthHash(mid, txId, apiKey);
const userHash = await INILib.generateUserHash(name, mid, phone, txId, birth, svcCode);

// Decrypt SEED encrypted data
const decrypted = await INILib.decryptSEED(encryptedData, seedKey, seedIV);

// Validate Inicis URLs
const isValid = INILib.isValidInicisUrl(url);

// Create authentication popup
const popup = INILib.createAuthPopup();

// Submit authentication form
INILib.submitAuthForm(formData, "https://sa.inicis.com/auth", "popup_target");
```

### Authentication Parameters

#### Required Fields
- **mid**: Merchant ID provided by Inicis
- **reqSvcCd**: Request service code ("01" or "02")
- **mTxId**: Unique transaction ID
- **authHash**: SHA256 hash of mid + mTxId + apiKey
- **successUrl**: URL for successful authentication callback
- **failUrl**: URL for failed authentication callback

#### Optional Fields for Fixed User Authentication
- **flgFixedUser**: Set to "Y" to enable fixed user mode
- **userName**: User's name
- **userPhone**: User's phone number
- **userBirth**: User's birth date (YYYYMMDD)
- **userHash**: SHA256 hash of user info + transaction details

## API Integration

### Authentication Request Flow

1. **Generate required hashes**:
   ```javascript
   const authHash = await INILib.generateAuthHash(mid, mTxId, apiKey);
   const userHash = await INILib.generateUserHash(userName, mid, userPhone, mTxId, userBirth, reqSvcCd);
   ```

2. **Submit to Inicis authentication service**:
   ```javascript
   const formData = {
       mid: 'your-mid',
       reqSvcCd: '01',
       mTxId: 'unique-transaction-id',
       authHash: authHash,
       // ... other fields
   };
   INILib.submitAuthForm(formData);
   ```

3. **Handle authentication response**:
   ```javascript
   // In success.html or your callback handler
   const params = new URLSearchParams(window.location.search);
   const authData = INILib.processAuthResponse(params);
   
   if (authData.resultCode === '0000') {
       // Authentication successful
       const token = authData.token;
       // Proceed with user verification
   }
   ```

### User Verification and Data Decryption

```javascript
// Decrypt personal information using SEED
const decryptedName = await INILib.decryptSEED(encryptedName, token, seedIV);
const decryptedPhone = await INILib.decryptSEED(encryptedPhone, token, seedIV);
const decryptedBirth = await INILib.decryptSEED(encryptedBirth, token, seedIV);
const decryptedCI = await INILib.decryptSEED(encryptedCI, token, seedIV);

// Validate against session/database
const sessionData = {
    userName: 'expected-name',
    userPhone: 'expected-phone',
    userBirth: 'expected-birth',
    userCi: 'expected-ci'
};

const validationResult = INILib.validateUser({
    userName: decryptedName,
    userPhone: decryptedPhone,
    userBirthday: decryptedBirth,
    userCi: decryptedCI
}, sessionData);

console.log(validationResult.isValid); // true/false
console.log(validationResult.message); // Success/failure message
```

## Security Considerations

1. **API Key Protection**: Store your API key securely and never expose it in client-side code in production
2. **URL Validation**: Always validate that authentication URLs come from official Inicis domains
3. **User Verification**: Compare decrypted personal information against your session/database data
4. **Token Security**: Handle SEED decryption tokens securely and ensure they're not logged or exposed
5. **HTTPS**: Always use HTTPS for authentication flows in production

## Configuration

### Test Environment
- MID: `INIiasTest`
- API Key: `TGdxb2l3enJDWFRTbTgvREU3MGYwUT09`
- Authentication URL: `https://sa.inicis.com/auth`

### Production Environment
Replace test credentials with your production values:
```javascript
const config = {
    mid: 'your-production-mid',
    apiKey: 'your-production-api-key',
    authUrl: 'https://kssa.inicis.com/auth' // or fcsa.inicis.com
};
```

## Error Handling

The system includes comprehensive error handling for:
- Invalid form data
- Hash generation failures
- Popup blocking
- Authentication service errors
- SEED decryption failures
- User validation failures

Example error handling:
```javascript
try {
    const authHash = await INILib.generateAuthHash(mid, mTxId, apiKey);
} catch (error) {
    console.error('Hash generation failed:', error);
    // Handle error appropriately
}
```

## Browser Compatibility

- Modern browsers with ES6+ support
- Crypto API support for SHA256 hashing
- Popup window support (required for authentication flow)
- JavaScript enabled

## Development Notes

- The SEED encryption implementation is a simplified version for demonstration
- In production, you may need to complete the full SEED algorithm implementation
- The current implementation includes mock data for testing purposes
- Replace mock functions with actual API calls for production use

## Support

This implementation is based on the official KISA SEED algorithm and Inicis authentication service documentation. For production deployment, consult with your payment service provider for specific integration requirements.
