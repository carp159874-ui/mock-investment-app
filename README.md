# 📈 주식 모의투자 사이트

코스피 100 / 코스닥 100 / 미국 100 종목 실시간(지연) 주가 기반 모의투자 시뮬레이터

## 기능
- 회원가입 / 로그인 (선생님 / 학생 구분)
- 초기 자금 1,000만원 지급
- 코스피·코스닥·미국 300개 종목 주가 조회 (Yahoo Finance, 15~20분 지연)
- 매수 / 매도
- 거래 내역 조회
- 전체 종목 목록
- 수익률 랭킹 (개인 / 팀)
- 팀 관리, 학생 관리 (선생님 전용)
- 닉네임 변경

> ⚠️ 데이터는 브라우저 localStorage에 저장됩니다. 다른 기기에서는 공유되지 않습니다.
> 선생님 코드: **TEACHER2024**

---

## Railway 배포 방법 (코딩 없이 가능!)

### 1단계: GitHub에 올리기
1. [github.com](https://github.com) 로그인
2. 오른쪽 상단 `+` → `New repository` 클릭
3. Repository name: `mock-investment` 입력 후 `Create repository`
4. `uploading an existing file` 클릭
5. 이 폴더 안의 **모든 파일을 드래그앤드롭**으로 업로드
6. `Commit changes` 클릭

### 2단계: Railway에서 배포
1. [railway.app](https://railway.app) 접속 → GitHub로 로그인
2. `New Project` → `Deploy from GitHub repo`
3. 방금 만든 `mock-investment` 저장소 선택
4. 자동으로 빌드 & 배포 시작 (약 2~3분)
5. `Settings` → `Networking` → `Generate Domain` 클릭
6. 생성된 URL로 접속하면 완료! ✅

---

## 로컬에서 실행하기 (선택사항)
```bash
npm install
npm run dev
# http://localhost:3000 접속
```
