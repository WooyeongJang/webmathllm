# TinyMath Model Directory

이 폴더에는 TinyMath Q4 모델 파일들이 위치합니다.

## 필요한 파일들:
- 모델 가중치 파일들 (.bin, .safetensors 등)
- 모델 설정 파일 (config.json)
- 토크나이저 파일들 (tokenizer.json, vocab.json 등)

## 모델 설치 방법:

### 1. Hugging Face에서 다운로드
```bash
# Hugging Face CLI 사용
huggingface-cli download [model-name] --local-dir ./tinymath-model/
```

### 2. 수동 다운로드
Hugging Face 모델 페이지에서 직접 파일들을 다운로드하여 이 폴더에 배치

### 3. WebLLM 호환 형식
WebLLM에서 사용하려면 모델이 WebLLM 호환 형식으로 변환되어야 할 수 있습니다.

## 지원되는 모델 형식:
- GGML/GGUF 형식
- WebLLM 네이티브 형식
- Quantized 모델 (Q4, Q8 등)

## 참고사항:
- 모델 크기에 따라 로딩 시간이 달라질 수 있습니다
- 브라우저의 메모리 제한을 고려해주세요
- 로컬에서만 실행되며 인터넷 연결이 필요하지 않습니다
