# 🎤 Rayjinblis Audio Checker

音声ファイルと文字データの一致度を自動チェックするWebアプリ。

## 🌟 機能

- 🎵 音声ファイルをアップロード（MP3, WAV, OGG, FLAC対応）
- 📝 照合テキストを手入力またはコピペ
- 🔍 Google Cloud Speech-to-Text API で自動認識
- 📊 照合スコア（0〜100%）をプログレスバーで表示
- 🎨 差分ハイライト（赤：テキストにあり未認識、青：認識されたが元テキストにない）

## 💰 料金

- **月60分まで無料**
- その後は従量課金制（$0.024/分程度）

## 🚀 セットアップ

### 1. Google Cloud API キー取得

[Google Cloud Console](https://console.cloud.google.com) で：

1. 新しいプロジェクトを作成
1. Speech-to-Text API を有効化
1. API キーを生成

### 2. アプリを開く

```
https://rayjinblis-audio-checker.vercel.app/
```

### 3. API キーを入力して使用

## 📱 使い方

1. Google Cloud API キーを入力
1. 音声ファイル（MP3など）をアップロード
1. Word から文字をコピペ
1. 「音声を認識して照合」をクリック
1. スコア＆差分が表示される

## 🛠 開発

```bash
# インストール
npm install

# ローカルサーバー起動
npm run dev

# ビルド
npm run build
```

## 📄 ライセンス

MIT
