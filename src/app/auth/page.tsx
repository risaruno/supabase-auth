'use client';

import { useAuth } from './Auth';

export default function AuthPage() {
  const {
    formData,
    status,
    debugInfo,
    isHashGenerated,
    authResult,
    verificationResult,
    isProcessingResult,
    generateHashes,
    requestAuthentication,
    clearResults,
    handleInputChange,
    getFieldLabel
  } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Inicis 본인인증 테스트</h1>
          </div>

          <div className="p-6">
            {/* Authentication Results */}
            {authResult && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">인증 결과</h3>
                <div className="space-y-2 text-sm text-black">
                  <div><strong>결과 코드:</strong> {authResult.resultCode}</div>
                  <div><strong>결과 메시지:</strong> {authResult.resultMsg}</div>
                  <div><strong>거래 ID:</strong> {authResult.txId}</div>
                  <div><strong>토큰:</strong> {authResult.token}</div>
                </div>
              </div>
            )}

            {/* User Verification Results */}
            {verificationResult && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  사용자 정보 검증 결과 {isProcessingResult && "(처리 중...)"}
                  {verificationResult.isDecrypted && (
                    <span className="text-blue-600 text-sm ml-2">🔓 복호화됨</span>
                  )}
                  {verificationResult.isDecrypted === false && (
                    <span className="text-gray-600 text-sm ml-2">📄 원본 데이터</span>
                  )}
                </h3>
                <div className="space-y-2 text-sm text-black">
                  <div><strong>사용자명:</strong> {verificationResult.userName}</div>
                  <div><strong>전화번호:</strong> {verificationResult.userPhone}</div>
                  <div><strong>생년월일:</strong> {verificationResult.userBirthday}</div>
                  <div>
                    <strong>CI:</strong> {verificationResult.userCi || '(빈 값 - 테스트 환경)'}
                    {!verificationResult.userCi && (
                      <span className="text-orange-600 text-xs ml-2">
                        ⚠️ 테스트 환경에서는 CI가 제공되지 않을 수 있습니다
                      </span>
                    )}
                  </div>
                  {verificationResult.userDi && (
                    <div><strong>DI:</strong> {verificationResult.userDi}</div>
                  )}
                  
                  {/* Additional info from raw data */}
                  {verificationResult.rawData && (
                    <>
                      {verificationResult.rawData.providerDevCd && (
                        <div><strong>인증 제공자:</strong> {verificationResult.rawData.providerDevCd}</div>
                      )}
                      {verificationResult.rawData.svcCd && (
                        <div><strong>서비스 코드:</strong> {verificationResult.rawData.svcCd}</div>
                      )}
                      {verificationResult.rawData.mTxId && (
                        <div><strong>거래 ID (mTxId):</strong> {verificationResult.rawData.mTxId}</div>
                      )}
                    </>
                  )}
                  
                  {/* Raw encrypted data display */}
                  {verificationResult.rawData && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">원본 암호화 데이터:</h4>
                      <div className="bg-gray-100 border border-gray-300 rounded p-3 max-h-60 overflow-y-auto">
                        <pre className="text-xs text-gray-800">
                          {JSON.stringify(verificationResult.rawData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form className="space-y-4">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-black">
                    {getFieldLabel(key)}:
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(key as keyof typeof formData, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    readOnly={key === 'authHash' || key === 'userHash'}
                  />
                </div>
              ))}

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={generateHashes}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  해시 생성
                </button>
                <button
                  type="button"
                  onClick={requestAuthentication}
                  disabled={!isHashGenerated}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  인증요청
                </button>
                {authResult && (
                  <button
                    type="button"
                    onClick={clearResults}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    새 인증
                  </button>
                )}
              </div>
            </form>

            {/* Status message */}
            {status && (
              <div className={`mt-6 p-4 rounded-lg ${
                status.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                status.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                'bg-blue-50 border border-blue-200 text-blue-800'
              }`}>
                {status.message}
              </div>
            )}

            {/* Debug information */}
            {debugInfo && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">디버그 정보</h3>
                <pre className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-xs overflow-x-auto">
                  {debugInfo}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}