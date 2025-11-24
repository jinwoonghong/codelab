# Academic Link

학술 영어(Academic English)와 학회 네트워킹(Conference Networking)을 연습하는 모바일 웹 앱입니다.

## Features

### 1. Academic Mode (MAP Training)
- Manchester Academic Phrasebank 기반 문장 패턴 연습
- **Slot & Fill** 방식으로 자신의 연구 내용을 빈칸에 채워 학습
- AI가 문법 오류 체크 및 더 자연스러운 학술적 표현 제안
- 카테고리별 연습: Introduction, Methodology, Results, Discussion, Conclusion

### 2. Networking Mode (학회 스몰토크 시뮬레이터)
- 학회 현장 상황별 롤플레잉 대화 연습
- **6가지 시나리오**:
  - Elevator Pitch (엘리베이터 피치)
  - Coffee Break (커피 브레이크)
  - Poster Session (포스터 세션 질문하기)
  - After Talk (발표 후 대화)
  - Networking Dinner (네트워킹 디너)
  - Farewell (작별 인사)
- **음성 입력 지원**: Web Speech API 활용
- **Hint 기능**: 막힐 때 적절한 답변 샘플 3가지 제공

### 3. Settings
- 연구 분야(Research Topic) 저장
- 프로필 설정 (이름, 소속)
- 연습 통계 확인

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React + Tailwind CSS
- **AI**: OpenAI API (gpt-4o-mini)
- **Speech**: Web Speech API (STT)

## Getting Started

### 1. Install dependencies

```bash
cd projects/academic-link
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

> Note: The app works without an API key using mock data, but AI feedback will be limited.

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your mobile browser (or use responsive mode).

## Project Structure

```
academic-link/
├── src/
│   ├── app/
│   │   ├── academic/         # Academic Mode page
│   │   ├── networking/       # Networking Mode page
│   │   ├── settings/         # Settings page
│   │   ├── api/
│   │   │   ├── chat/        # Chat API route
│   │   │   └── feedback/    # Feedback API route
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Redirect to /academic
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/              # Shared UI components
│   │   ├── academic/        # Academic mode components
│   │   └── networking/      # Networking mode components
│   ├── data/
│   │   ├── academic-templates.ts   # MAP sentence templates
│   │   └── networking-scenarios.ts # Conversation scenarios
│   ├── hooks/
│   │   └── useSpeechRecognition.ts # Voice input hook
│   └── lib/                  # Utility functions
├── public/
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## OpenAI API System Prompts

### Academic Feedback Prompt
```
You are an expert academic English writing tutor specializing in helping
non-native English speakers improve their academic writing.

Your role is to:
1. Check grammatical correctness of the submitted academic sentence
2. Evaluate if the vocabulary and phrasing is appropriate for academic writing
3. Suggest improvements while maintaining the original meaning
4. Be encouraging but honest about areas for improvement
```

### Networking Conversation Prompt
```
You are a friendly researcher at an academic conference engaging in
a [scenario] conversation.

Conversation guidelines:
1. Keep responses natural, friendly, and conversational (2-3 sentences max)
2. Show genuine interest in their research
3. Ask follow-up questions to keep the conversation flowing
4. Use appropriate academic small talk patterns
```

## Usage Tips

1. **Set your research topic first** - Go to Settings and save your research area for personalized practice.
2. **Daily practice** - Just 3 sentences a day in Academic Mode builds consistency.
3. **Use voice input** - In Networking Mode, practice speaking rather than typing.
4. **Use hints wisely** - If stuck, use the hint button but try to modify suggestions.

## Cost Optimization

The app uses `gpt-4o-mini` model which is cost-effective:
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens

Average session cost: < $0.01

## License

MIT
