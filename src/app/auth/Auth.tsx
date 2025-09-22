import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { decryptSEED } from '../../lib/INILib';

// Utility function for SHA-256 hashing
const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Types
export interface AuthFormData {
  mid: string;
  reqSvcCd: string;
  identifier: string;
  mTxId: string;
  authHash: string;
  flgFixedUser: string;
  userName: string;
  userPhone: string;
  userBirth: string;
  userHash: string;
  reservedMsg: string;
  directAgency: string;
  successUrl: string;
  failUrl: string;
}

export interface StatusMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AuthResult {
  resultCode: string;
  resultMsg: string;
  authRequestUrl: string;
  txId: string;
  token: string;
}

export interface VerificationResult {
  userName: string;
  userPhone: string;
  userBirthday: string;
  userCi: string;
  userDi?: string;
  rawData?: Record<string, string>;
  decryptedData?: {
    userName?: string;
    userPhone?: string;
    userBirthday?: string;
    userCi?: string;
    userDi?: string;
  };
  isDecrypted?: boolean;
}

// Custom hook for authentication logic
export const useAuth = () => {
  const [formData, setFormData] = useState<AuthFormData>({
    mid: 'INIiasTest',
    reqSvcCd: '01',
    identifier: '테스트서명입니다.',
    mTxId: '',
    authHash: '',
    flgFixedUser: 'Y',
    userName: '홍길동',
    userPhone: '01012341234',
    userBirth: '199010101',
    userHash: '',
    reservedMsg: 'isUseToken=Y',
    directAgency: '',
    successUrl: '',
    failUrl: ''
  });

  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isHashGenerated, setIsHashGenerated] = useState(false);
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isProcessingResult, setIsProcessingResult] = useState(false);

  const searchParams = useSearchParams();
  const apiKey = 'TGdxb2l3enJDWFRTbTgvREU3MGYwUT09';

  // Initialize transaction ID and URLs
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + 
               String(now.getMinutes()).padStart(2, '0') + 
               String(now.getSeconds()).padStart(2, '0');
    
    const txId = `test_${year}${month}${day}_${time}`;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    setFormData(prev => ({
      ...prev,
      mTxId: txId,
      successUrl: `${baseUrl}/api/auth-callback`,
      failUrl: `${baseUrl}/api/auth-callback`
    }));
  }, []);

  // Generate authentication hashes
  const generateHashes = useCallback(async () => {
    try {
      const { mid, mTxId, userName, userPhone, userBirth, reqSvcCd, flgFixedUser } = formData;

      if (!mid || !mTxId) {
        setStatus({ message: 'MID와 거래ID를 입력해주세요.', type: 'error' });
        return;
      }

      const authHashInput = mid + mTxId + apiKey;
      const authHash = await sha256(authHashInput);

      let userHash = '';
      if (flgFixedUser === 'Y') {
        if (!userName || !userPhone || !userBirth) {
          setStatus({ message: '고정사용자 옵션 사용시 사용자 정보를 모두 입력해주세요.', type: 'error' });
          return;
        }

        const userHashInput = userName + mid + userPhone + mTxId + userBirth + reqSvcCd;
        userHash = await sha256(userHashInput);
      }

      setFormData(prev => ({
        ...prev,
        authHash,
        userHash
      }));

      setIsHashGenerated(true);
      setStatus({ message: '해시가 성공적으로 생성되었습니다.', type: 'success' });

      let debug = `Auth Hash Input: ${authHashInput}\nAuth Hash: ${authHash}`;
      if (flgFixedUser === 'Y') {
        const userHashInput = userName + mid + userPhone + mTxId + userBirth + reqSvcCd;
        debug += `\n\nUser Hash Input: ${userHashInput}\nUser Hash: ${userHash}`;
      }
      setDebugInfo(debug);

    } catch (error) {
      console.error('Hash generation error:', error);
      setStatus({ message: '해시 생성 중 오류가 발생했습니다.', type: 'error' });
    }
  }, [formData, apiKey]);

  // Process authentication results
  const processAuthenticationResult = useCallback(async (result: AuthResult) => {
    setIsProcessingResult(true);

    try {
      // Validate Inicis URL first (basic URL validation)
      if (!result.authRequestUrl || !result.authRequestUrl.includes('inicis.com')) {
        setStatus({ message: '유효하지 않은 인증 URL입니다.', type: 'error' });
        return;
      }

      // Make actual HTTP request to get user verification data
      const verificationResponse = await fetch('/api/auth-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authRequestUrl: result.authRequestUrl,
          txId: result.txId,
          mid: formData.mid
        })
      });

      if (!verificationResponse.ok) {
        let errorMessage = 'Verification request failed';
        try {
          const errorData = await verificationResponse.json();
          
          // Handle specific Inicis error codes
          if (errorData.resultCode === '9025') {
            errorMessage = '이 인증 결과는 이미 조회되었습니다. 새로운 인증을 진행해주세요.';
          } else if (errorData.resultMsg) {
            errorMessage = `인증 서버 오류: ${errorData.resultMsg}`;
          } else {
            errorMessage = errorData.error || errorData.details || errorMessage;
          }
        } catch {
          // If JSON parsing fails, use a generic error message
          errorMessage = `Verification request failed with status ${verificationResponse.status}`;
        }
        throw new Error(errorMessage);
      }

      const encryptedData = await verificationResponse.json();
      console.log('Received encrypted data:', encryptedData);
      
      // Check if we have the expected response structure
      if (!encryptedData.userName || !encryptedData.userPhone || !encryptedData.userBirthday) {
        throw new Error('Invalid response format from authentication server');
      }
      
      // Attempt to decrypt the data if encryption keys are available
      let decryptedData: {
        userName?: string;
        userPhone?: string;
        userBirthday?: string;
        userCi?: string;
        userDi?: string;
      } | null = null;
      let isDecrypted = false;
      
      // Check if data appears to be encrypted (Base64-like strings)
      const looksEncrypted = (value: string) => {
        return value && value.length > 20 && /^[A-Za-z0-9+/=]+$/.test(value);
      };
      
      // Attempt decryption if we have encrypted-looking data
      if (looksEncrypted(encryptedData.userName) || looksEncrypted(encryptedData.userPhone)) {
        try {
          // Use Inicis SEED encryption parameters
          // KEY: BASE64 decode the token parameter to get 16-byte key
          const seedKey = result.token; // Token from authentication result (BASE64 encoded)
          const seedIV = "SASKGINICIS00000"; // Standard Inicis IV (16 bytes)
          
          console.log('Attempting decryption with token:', seedKey);
          console.log('Token length:', seedKey?.length);
          console.log('Using IV:', seedIV);
          
          decryptedData = {
            userName: encryptedData.userName ? decryptSEED(encryptedData.userName, seedKey, seedIV) : encryptedData.userName,
            userPhone: encryptedData.userPhone ? decryptSEED(encryptedData.userPhone, seedKey, seedIV) : encryptedData.userPhone,
            userBirthday: encryptedData.userBirthday ? decryptSEED(encryptedData.userBirthday, seedKey, seedIV) : encryptedData.userBirthday,
            userCi: encryptedData.userCi ? decryptSEED(encryptedData.userCi, seedKey, seedIV) : encryptedData.userCi,
            userDi: encryptedData.userDi ? decryptSEED(encryptedData.userDi, seedKey, seedIV) : encryptedData.userDi
          };
          
          console.log('Decryption attempt completed');
          console.log('Original userName:', encryptedData.userName);
          console.log('Decrypted userName:', decryptedData.userName);
          
          // Check if decryption produced reasonable results
          if (decryptedData.userName && decryptedData.userName !== encryptedData.userName) {
            isDecrypted = true;
            console.log('Successfully decrypted user data');
          }
        } catch (decryptError) {
          console.warn('Decryption failed, using raw data:', decryptError);
          decryptedData = null;
        }
      }
      
      // Create verification result with both raw and decrypted data
      const rawData: VerificationResult = {
        userName: isDecrypted && decryptedData?.userName ? decryptedData.userName : (encryptedData.userName || 'N/A'),
        userPhone: isDecrypted && decryptedData?.userPhone ? decryptedData.userPhone : (encryptedData.userPhone || 'N/A'),
        userBirthday: isDecrypted && decryptedData?.userBirthday ? decryptedData.userBirthday : (encryptedData.userBirthday || 'N/A'),
        userCi: isDecrypted && decryptedData?.userCi ? decryptedData.userCi : (encryptedData.userCi || ''),
        userDi: isDecrypted && decryptedData?.userDi ? decryptedData.userDi : (encryptedData.userDi || undefined),
        rawData: encryptedData,
        decryptedData: (isDecrypted && decryptedData) ? decryptedData : undefined,
        isDecrypted
      };

      console.log('Final verification result:', rawData);
      console.log('Decryption status:', isDecrypted ? 'Decrypted' : 'Raw data');
      console.log('Decrypted Data:', decryptedData);
      
      setVerificationResult(rawData);

      // Check if CI is missing and provide informative message
      const isTestMode = encryptedData.mid === 'INIiasTest';
      const isCiMissing = !rawData.userCi || rawData.userCi.trim() === '';
      const decryptionStatus = isDecrypted ? ' (복호화됨)' : ' (원본 데이터)';
      
      if (isCiMissing && isTestMode) {
        setStatus({ 
          message: `인증 데이터를 받았습니다${decryptionStatus}! ⚠️ 참고: 테스트 환경에서는 CI(Connecting Information)가 제공되지 않습니다. 실제 운영 환경에서는 CI가 정상적으로 수집됩니다.`, 
          type: 'info' 
        });
      } else if (isCiMissing) {
        setStatus({ 
          message: `인증 데이터를 받았습니다${decryptionStatus}! ⚠️ CI가 비어있습니다. 인증 서비스 설정을 확인해주세요.`, 
          type: 'info' 
        });
      } else {
        setStatus({ 
          message: `인증 데이터를 성공적으로 받았습니다${decryptionStatus}! CI 포함 ✅`, 
          type: 'success' 
        });
      }

    } catch (error) {
      console.error('Authentication processing error:', error);
      setStatus({ message: '인증 결과 처리 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsProcessingResult(false);
    }
  }, [formData.mid]);

  // Process authentication results from URL parameters
  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    const resultMsg = searchParams.get('resultMsg');
    const authRequestUrl = searchParams.get('authRequestUrl');
    const txId = searchParams.get('txId');
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setStatus({ message: `오류 발생: ${error}`, type: 'error' });
      return;
    }

    if (resultCode && txId) {
      const result: AuthResult = {
        resultCode,
        resultMsg: resultMsg ? decodeURIComponent(resultMsg) : '',
        authRequestUrl: authRequestUrl || '',
        txId,
        token: token || ''
      };

      console.log('Authentication Result:', result);
      
      setAuthResult(result);
      
      if (resultCode === '0000') {
        setStatus({ message: '인증이 성공했습니다. 사용자 정보를 검증하고 있습니다...', type: 'success' });
        processAuthenticationResult(result);
      } else {
        setStatus({ message: `인증 실패: ${result.resultMsg}`, type: 'error' });
      }
    }
  }, [searchParams, processAuthenticationResult]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Request authentication
  const requestAuthentication = useCallback(() => {
    try {
      const requiredFields: (keyof AuthFormData)[] = ['mid', 'reqSvcCd', 'mTxId', 'authHash', 'successUrl', 'failUrl'];
      for (const field of requiredFields) {
        if (!formData[field].trim()) {
          setStatus({ message: `${field} 필드를 입력해주세요.`, type: 'error' });
          return;
        }
      }

      // Create authentication form and submit to popup
      const authUrl = 'https://sa.inicis.com/auth';
      const popup = window.open(
        '', 
        'auth_popup', 
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        setStatus({ message: '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.', type: 'error' });
        return;
      }

      // Create form and submit to popup
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = authUrl;
      form.target = 'auth_popup';

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value.trim()) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      setStatus({ message: '인증 팝업이 열렸습니다. 팝업에서 인증을 진행해주세요.', type: 'info' });

    } catch (error) {
      console.error('Authentication request error:', error);
      setStatus({ message: '인증 요청 중 오류가 발생했습니다.', type: 'error' });
    }
  }, [formData]);

  // Clear authentication results
  const clearResults = useCallback(() => {
    setAuthResult(null);
    setVerificationResult(null);
    setStatus(null);
    window.history.replaceState({}, '', '/auth');
  }, []);

  // Get field labels for UI
  const getFieldLabel = useCallback((key: string): string => {
    const labels: Record<string, string> = {
      mid: 'MID',
      reqSvcCd: '요청구분코드',
      identifier: '식별자',
      mTxId: '거래ID',
      authHash: '인증해시',
      flgFixedUser: '고정사용자',
      userName: '사용자명',
      userPhone: '전화번호',
      userBirth: '생년월일',
      userHash: '사용자해시',
      reservedMsg: '예약메시지',
      directAgency: '직접기관',
      successUrl: '성공URL',
      failUrl: '실패URL'
    };
    return labels[key] || key;
  }, []);

  return {
    // State
    formData,
    status,
    debugInfo,
    isHashGenerated,
    authResult,
    verificationResult,
    isProcessingResult,
    
    // Actions
    generateHashes,
    requestAuthentication,
    clearResults,
    handleInputChange,
    getFieldLabel
  };
};
