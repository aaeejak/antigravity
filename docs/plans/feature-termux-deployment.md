# 안드로이드 공기계 (Termux) 24시간 핫딜 크롤러 서버 구축 가이드

안드로이드 스마트폰에 `Termux` 앱을 설치하여 리눅스 서버처럼 활용하는 방법입니다.  
가정용 공유기(Wi-Fi)에 연결되어 있으므로, 펨코/퀘이사존 등 깐깐한 커뮤니티의 **해외 IP 차단을 100% 무력화**할 수 있습니다.

---

## 📱 1. 안드로이드 사전 세팅 (필수)
1. 구글 플레이스토어가 아닌, 최신 버전 제공처인 **[F-Droid(클릭)](https://f-droid.org/en/packages/com.termux/)** 나 **Github**에서 `Termux` APK 파일을 다운로드 후 설치하세요. (플레이스토어 버전은 업데이트가 중단되어 에러가 납니다.)
2. 안드로이드 설정 > 애플리케이션 > Termux > **[배터리 제한 없음(최적화 제외)]** 으로 설정하세요. (이 화면이 꺼져도 크롤링이 멈추지 않게 하기 위함입니다.)
3. 와이파이를 연결하고 가급적 충전기를 상시 꽂아두세요.

---

## ⚙️ 2. Termux 앱 실행 후 기본 명령어 입력 (복사 붙여넣기)

스마트폰에서 Termux 앱을 켜면 검은 화면이 나옵니다.
아래 명령어들을 순서대로 한 줄씩 복사해서 실행하세요.

### 2-1. 저장소 접근 권한 허용 및 패키지 업데이트
```bash
termux-setup-storage
pkg update -y && pkg upgrade -y
```
*(중간에 `y/n`을 묻는 화면이 나오면 무조건 `y` 누르고 엔터 또는 그냥 엔터만 연타하시면 됩니다.)*

### 2-2. 필수 환경 (Node.js, Git, Cron) 설치
```bash
pkg install nodejs git cronie nano -y
```

### 2-3. 핫딜모음 소스코드 다운로드 (Clone)
사용자님의 핫딜모음 깃허브 주소를 클론합니다.
```bash
git clone https://github.com/aaeejak/antigravity.git
cd antigravity/crawler
```

### 2-4. Node 의존성 라이브러리 설치
```bash
npm install
```

---

## 🔑 3. Supabase 환경 변수 설정 (.env)
크롤링된 결과가 Supabase DB로 전송되려면 키가 필요합니다.

1. `.env` 파일을 만듭니다.
```bash
nano .env
```
2. 아래 내용을 스마트폰 화면에 복사해서 붙여넣습니다. (기존 로컬 PC에 있던 값과 동일하게 입력하세요)
```env
SUPABASE_URL=사용자님의_수파베이스_URL
SUPABASE_KEY=사용자님의_수파베이스_경로주소키
```
3. 저장하는 방법: `Ctrl` 키(화면 위쪽 버튼) 누르고 `x` 누른 후, `y` 누르고 `엔터(Enter)` 

---

## 🚀 4. 테스트 크롤링 실행해보기
자동화를 걸기 전에 한 번 싹 긁어올 수 있는지 수동으로 테스트해봅니다.

```bash
node run.js
```
*화면에 에러 없이 `Successfully saved to Supabase.` 메시지가 뜨면 완벽하게 성공한 것입니다!*

---

## ⏰ 5. 10분 주기 자동 스케줄러(Crontab) 등록
이제 내가 자고 있을 때도 10분마다 위 명령어가 돌도록 세팅합니다.

1. 크론탭 편집기로 들어갑니다.
```bash
crontab -e
```
2. 맨 아랫줄에 다음 내용을 똑같이 적어 넣습니다.
```bash
*/10 * * * * cd ~/antigravity/crawler && node run.js >> ~/crawler.log 2>&1
```
3. 저장하고 나옵니다. (`Ctrl + x` -> `y` -> `Enter`)

4. **크론 데몬(백그라운드 타이머)을 실행합니다.** (Termux를 켤 때마다 한 번씩 쳐줘야 합니다)
```bash
crond
```

### 🎉 모든 세팅이 완료되었습니다!
이제 폰 화면을 끄고 충전기만 꽂은 채 구석에 놔두시면 됩니다.  
잘 수집되는지 로그를 보려면 Termux에서 언제든지 아래 명령어를 쳐보세요.
```bash
cat ~/crawler.log
```
