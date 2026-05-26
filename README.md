# gametalk

카카오톡 챗봇 스킬 서버로 붙일 수 있는 텍스트 RPG MVP입니다.

## 실행

```bash
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 로컬 테스트

```bash
curl -X POST http://localhost:3000/test ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"u1\",\"text\":\"상태\"}"
```

PowerShell에서는:

```powershell
Invoke-RestMethod http://localhost:3000/test -Method Post -ContentType "application/json" -Body '{"userId":"u1","text":"상태"}'
```

## 카카오 챗봇 스킬 URL

카카오 i 오픈빌더 스킬 서버 URL에 아래 주소를 연결합니다.

```text
POST /kakao/skill
```

배포 후 예시는 다음과 같습니다.

```text
https://example.com/kakao/skill
```

## 명령어

- `상태`
- `마을`
- `이동 숲 마을`
- `사냥`
- `공격`, `방어`, `스킬`, `도망`
- `상점`
- `구매 철검`
- `인벤토리`
- `장착 철검`
- `스탯 힘 1`
- `전직 전사`
- `던전생성`
- `던전참가 1`
- `준비`

## 현재 구현된 내용

- 초보자 캐릭터 자동 생성
- 레벨, 경험치, 골드, HP/MP
- 스탯 포인트와 스탯 투자
- 전직: 전사, 마법사, 궁수, 도적
- 여러 마을 이동
- 마을별 상점
- 무기/방어구 구매와 장착
- 1인 턴제 사냥
- 파티 인스턴스 던전의 기본 턴 처리
- `data/db.json` 파일 저장
