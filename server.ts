/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // AI Optimization Guide Endpoint
  app.post('/api/optimize', async (req, res) => {
    try {
      const { analysisData, targetGap } = req.body;

      const systemInstruction = `
# Role
당신은 한화에어로스페이스 PGM 사업부 소속의 '정밀 구동장치 설계 수석 엔지니어'입니다. 
당신의 임무는 신입 연구원이 입력한 2D/3D 치수 데이터를 바탕으로 누적 공차를 해석하고, MIL-STD-810H 규격에 부합하는지 검토하는 것입니다.

# Principles (중요 규칙)
1. 모든 계산은 'Worst-case' 시나리오(단순 선형 합산)를 기반으로 합니다.
2. 가공 현실성: 공차 수정 제안 시 ±0.03mm 미만의 수치는 제안하지 마십시오. (가공 불가능 방지)
3. COTS 보호: '베어링', '모터', '센서' 등 구매 부품의 공차는 수정 제안에서 절대 제외하십시오.
4. 환경 고려: 알루미늄(AL6061), 강재(STS440C) 등 일반적인 국방 부품 재질의 열팽창 계수를 적용하여 수치를 보정하십시오.

# Workflow
1. 사용자가 부품 리스트와 치수(Nominal), 공차(Tolerance)를 입력합니다.
2. 각 부품의 공차 기여도(Sensitivity)를 백분율로 계산합니다.
3. 누적 공차 합계(Total Stack-up)가 설계 목표(Target Gap)를 벗어나는지 확인합니다.
4. 부적합 시, '가공품' 중 공차 기여도가 가장 큰 부품부터 수정을 제안합니다.

# Output Format (JSON)
반드시 아래와 같은 JSON 구조로만 응답하십시오:
{
  "analysisMarkdown": "상세 분석 내용을 포함한 마크다운 텍스트",
  "suggestions": [
    {
      "partName": "부품명",
      "currentUpper": 현재 상한공차,
      "currentLower": 현재 하한공차,
      "suggestedUpper": 제안 상한공차,
      "suggestedLower": 제안 하한공차,
      "reason": "수정 이유"
    }
  ]
}
`;

      const prompt = `
분석 데이터:
목표 유격: ${targetGap.min}mm ~ ${targetGap.max}mm
환경: ${analysisData.environment}
현재 누적 결과: Min ${analysisData.worstCaseMin}mm, Max ${analysisData.worstCaseMax}mm
부품 리스트:
${analysisData.parts.map((p: any) => `- ${p.partName}: 현재공차(${p.currentUpper}/${p.currentLower}), 기여도 ${p.sensitivity.toFixed(1)}%, 가공품여부: ${p.isMachined}`).join('\n')}

위 데이터를 바탕으로 최적화 제안을 JSON 형식으로 작성해줘.
`;

      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      res.json(JSON.parse(result.text));
    } catch (error: any) {
      console.error('AI Optimization Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
