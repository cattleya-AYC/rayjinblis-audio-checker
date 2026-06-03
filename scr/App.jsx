import React, { useState } from 'react';
import { Upload, Play, ZapOff, CheckCircle } from 'lucide-react';

export default function AudioTextChecker() {
  const [apiKey, setApiKey] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
      setError('');
    }
  };

  const handleReferenceTextChange = (e) => {
    setReferenceText(e.target.value);
  };

  const calculateMatchPercentage = (text1, text2) => {
    const normalize = (text) => text.toLowerCase().replace(/\s+/g, '');
    const norm1 = normalize(text1);
    const norm2 = normalize(text2);

    let matches = 0;
    const minLength = Math.min(norm1.length, norm2.length);

    for (let i = 0; i < minLength; i++) {
      if (norm1[i] === norm2[i]) matches++;
    }

    return Math.round((matches / Math.max(norm1.length, norm2.length)) * 100);
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      setError('音声ファイルを選択してください');
      return;
    }
    if (!apiKey.trim()) {
      setError('Google Cloud API キーを入力してください');
      return;
    }
    if (!referenceText.trim()) {
      setError('照合テキストを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 音声ファイルを Base64 に変換
      const arrayBuffer = await audioFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const audioContent = btoa(binary);

      // ファイルタイプからエンコーディングを判定
      let encoding = 'LINEAR16';
      if (audioFileName.endsWith('.mp3')) {
        encoding = 'MP3';
      } else if (audioFileName.endsWith('.ogg')) {
        encoding = 'OGG_OPUS';
      }

      // Google Cloud Speech-to-Text API を呼び出し
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              encoding: encoding,
              languageCode: 'ja-JP',
              sampleRateHertz: 16000,
            },
            audio: { content: audioContent },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API エラー');
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        let transcript = '';
        data.results.forEach((result) => {
          if (result.alternatives && result.alternatives[0]) {
            transcript += result.alternatives[0].transcript + ' ';
          }
        });
        transcript = transcript.trim();

        setTranscribedText(transcript);

        // 照合スコアを計算
        const score = calculateMatchPercentage(transcript, referenceText);
        setMatchPercentage(score);
        setShowDiff(true);
      } else {
        setError('音声が認識されませんでした。より大きな音声で試してください。');
      }
    } catch (err) {
      setError(`エラー: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const DiffHighlight = () => {
    const normalize = (text) => text.toLowerCase();
    const refNorm = normalize(referenceText);
    const transNorm = normalize(transcribedText);

    const refChars = referenceText.split('');
    const transChars = transcribedText.split('');

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">元テキスト（未認識部分は赤）</p>
          <p className="text-sm leading-relaxed">
            {refChars.map((char, idx) => {
              const isInTrans = transNorm.includes(normalize(char));
              return (
                <span
                  key={idx}
                  className={
                    isInTrans ? 'text-gray-800' : 'bg-red-200 text-red-800 font-semibold'
                  }
                >
                  {char}
                </span>
              );
            })}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">認識テキスト（余分な部分は青）</p>
          <p className="text-sm leading-relaxed">
            {transChars.map((char, idx) => {
              const isInRef = refNorm.includes(normalize(char));
              return (
                <span
                  key={idx}
                  className={
                    isInRef ? 'text-gray-800' : 'bg-blue-200 text-blue-800 font-semibold'
                  }
                >
                  {char}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">🎤 音声テキスト照合</h1>
          <p className="text-gray-700">Rayjinblis Audio Checker</p>
          <p className="text-xs text-gray-500 mt-2">Google Cloud Speech-to-Text API 使用</p>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* API キー入力 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔑 Google Cloud API キー
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-... から始まる API キー"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              <a
                href="https://console.cloud.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Google Cloud Console
              </a>
              で API キーを取得
            </p>
          </div>

          {/* 音声ファイル選択 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Upload className="inline mr-2" size={18} />
              音声ファイルをアップロード
            </label>
            <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center hover:bg-indigo-50 cursor-pointer transition">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
                className="hidden"
                id="audio-input"
              />
              <label htmlFor="audio-input" className="cursor-pointer block">
                <p className="text-gray-600">
                  {audioFileName || 'MP3, WAV, M4A などをクリック'}
                </p>
                <p className="text-xs text-gray-500 mt-1">対応形式: MP3, WAV, OGG, FLAC</p>
              </label>
            </div>
          </div>

          {/* 照合テキスト */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 照合テキスト
            </label>
            <textarea
              value={referenceText}
              onChange={handleReferenceTextChange}
              placeholder="Word から文字をコピペ"
              className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 実行ボタン */}
          <button
            onClick={handleTranscribe}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <ZapOff size={20} className="animate-spin" />
                認識中...
              </>
            ) : (
              <>
                <Play size={20} />
                音声を認識して照合
              </>
            )}
          </button>

          {/* 結果表示 */}
          {showDiff && (
            <div className="space-y-4">
              {/* スコア */}
              <div className="bg-indigo-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-indigo-600" size={24} />
                  <p className="text-gray-700 font-semibold">照合スコア</p>
                </div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">{matchPercentage}%</div>
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-500"
                    style={{ width: `${matchPercentage}%` }}
                  />
                </div>
              </div>

              {/* 差分表示 */}
              {transcribedText && <DiffHighlight />}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="text-center mt-6 text-xs text-gray-600">
          <p>月 60 分まで無料。その後は従量課金制です。</p>
        </div>
      </div>
    </div>
  );
}
