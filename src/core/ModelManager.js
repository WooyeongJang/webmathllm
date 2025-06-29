/**
 * AI 모델 관리 클래스
 * @module ModelManager
 * @version 1.0.0
 */

import { MODEL_CONFIG, CONFIG } from '../config/Environment.js';
import { ModelLoadError } from '../utils/ErrorHandler.js';

/**
 * AI 모델 로딩 및 관리를 담당하는 클래스
 */
export class ModelManager {
    /**
     * @param {Object} webllm - WebLLM 라이브러리
     * @param {boolean} isDevelopmentMode - 개발 모드 여부
     */
    constructor(webllm, isDevelopmentMode = false) {
        this.webllm = webllm;
        this.engine = null;
        this.isModelLoaded = false;
        this.currentModelId = null;
        this.loadingStartTime = null;
        this.isDevelopmentMode = isDevelopmentMode;
        this.config = isDevelopmentMode ? CONFIG.DEVELOPMENT : CONFIG.PRODUCTION;
    }

    /**
     * 모델 정보 반환
     * @param {string} modelId - 모델 ID
     * @returns {Object} 모델 정보
     */
    getModelInfo(modelId) {
        return MODEL_CONFIG[modelId] || {
            name: '알 수 없는 모델',
            size: '정보 없음',
            estimatedTime: '예상 불가',
            description: '모델 정보를 찾을 수 없습니다.'
        };
    }

    /**
     * 사용 가능한 모델 목록 반환
     * @returns {Array} 모델 목록
     */
    getAvailableModels() {
        return Object.keys(MODEL_CONFIG).map(id => ({
            id,
            ...MODEL_CONFIG[id]
        }));
    }

    /**
     * 모델 로딩
     * @param {string} modelId - 로딩할 모델 ID
     * @param {Function} progressCallback - 진행률 콜백 함수
     * @returns {Promise<Object>} 로딩된 엔진
     */
    async loadModel(modelId, progressCallback = null) {
        try {
            if (this.isDevelopmentMode) {
                console.log(`🔄 모델 로딩 시작: ${modelId}`);
            }

            this.loadingStartTime = Date.now();
            this.currentModelId = modelId;

            // 이전 엔진이 있다면 정리
            if (this.engine) {
                await this.unloadModel();
            }

            // WebLLM 엔진 생성
            this.engine = new this.webllm.MLCEngine();

            // 진행률 콜백 설정
            if (progressCallback) {
                this.engine.setInitProgressCallback(progressCallback);
            }

            // 모델 초기화
            await this.engine.reload(modelId);

            this.isModelLoaded = true;
            
            if (this.isDevelopmentMode) {
                const loadTime = (Date.now() - this.loadingStartTime) / 1000;
                console.log(`✅ 모델 로딩 완료: ${loadTime.toFixed(1)}초`);
            }

            return this.engine;

        } catch (error) {
            this.isModelLoaded = false;
            this.engine = null;
            
            const errorMessage = this.getLoadErrorMessage(error, modelId);
            throw new ModelLoadError(errorMessage, modelId);
        }
    }

    /**
     * 모델 언로딩
     */
    async unloadModel() {
        if (this.engine) {
            try {
                // WebLLM에 언로딩 메서드가 있다면 호출
                if (typeof this.engine.unload === 'function') {
                    await this.engine.unload();
                }
            } catch (error) {
                if (this.isDevelopmentMode) {
                    console.warn('⚠️ 모델 언로딩 중 경고:', error);
                }
            }
            
            this.engine = null;
            this.isModelLoaded = false;
            this.currentModelId = null;
            
            if (this.isDevelopmentMode) {
                console.log('🗑️ 모델 언로딩 완료');
            }
        }
    }

    /**
     * 모델 상태 확인
     * @returns {Object} 모델 상태 정보
     */
    getModelStatus() {
        return {
            isLoaded: this.isModelLoaded,
            currentModel: this.currentModelId,
            modelInfo: this.currentModelId ? this.getModelInfo(this.currentModelId) : null,
            engine: this.engine,
            loadingTime: this.loadingStartTime ? Date.now() - this.loadingStartTime : null
        };
    }

    /**
     * 모델 예열 (선택적)
     */
    async warmupModel() {
        if (!this.isModelLoaded || !this.engine) {
            throw new ModelLoadError('모델이 로딩되지 않았습니다.', this.currentModelId);
        }

        try {
            // 간단한 테스트 쿼리로 모델 예열
            await this.engine.chat.completions.create({
                messages: [{ role: 'user', content: '2+2=?' }],
                temperature: 0,
                max_tokens: 10
            });
            
            if (this.isDevelopmentMode) {
                console.log('🔥 모델 예열 완료');
            }
        } catch (error) {
            if (this.isDevelopmentMode) {
                console.warn('⚠️ 모델 예열 실패:', error);
            }
        }
    }

    /**
     * 수학 계산 실행
     * @param {string} problem - 수학 문제
     * @returns {Promise<string>} 계산 결과
     */
    async calculate(problem) {
        if (!this.isModelLoaded || !this.engine) {
            throw new ModelLoadError('모델이 로딩되지 않았습니다.', this.currentModelId);
        }

        try {
            const prompt = this.createMathPrompt(problem);
            
            const response = await this.engine.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 500
            });

            const result = response.choices[0]?.message?.content || '계산 결과를 가져올 수 없습니다.';
            
            if (this.isDevelopmentMode) {
                console.log('🧮 AI 계산 완료:', { problem, result: result.substring(0, 100) + '...' });
            }

            return result;

        } catch (error) {
            throw new ModelLoadError(
                `AI 계산 실행 중 오류: ${error.message}`,
                this.currentModelId
            );
        }
    }

    /**
     * 수학 문제용 프롬프트 생성
     * @param {string} problem - 수학 문제
     * @returns {string} 생성된 프롬프트
     */
    createMathPrompt(problem) {
        return `${problem}`;
    }

    /**
     * 로딩 에러 메시지 생성
     * @param {Error} error - 발생한 에러
     * @param {string} modelId - 모델 ID
     * @returns {string} 에러 메시지
     */
    getLoadErrorMessage(error, modelId) {
        const modelInfo = this.getModelInfo(modelId);
        
        if (error.message.includes('WebGPU') || error.message.includes('GPU')) {
            return `GPU 호환성 문제로 ${modelInfo.name} 모델을 로딩할 수 없습니다. 개발 모드를 사용하거나 다른 브라우저를 시도해보세요.`;
        } else if (error.message.includes('shader') || error.message.includes('WGSL')) {
            return `셰이더 컴파일 오류가 발생했습니다. q4f32 모델을 시도하거나 Chrome을 최신 버전으로 업데이트해주세요.`;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            return `네트워크 오류로 인해 ${modelInfo.name} 모델을 로딩할 수 없습니다. 인터넷 연결을 확인해주세요.`;
        } else if (error.message.includes('memory') || error.message.includes('Memory')) {
            return `메모리 부족으로 인해 ${modelInfo.name} 모델을 로딩할 수 없습니다. 다른 탭을 닫고 다시 시도해주세요.`;
        } else if (error.message.includes('not found')) {
            return `${modelInfo.name} 모델을 찾을 수 없습니다. 다른 모델을 선택해주세요.`;
        } else {
            return `${modelInfo.name} 모델 로딩 중 오류가 발생했습니다: ${error.message}`;
        }
    }

    /**
     * 메모리 사용량 추정
     * @param {string} modelId - 모델 ID
     * @returns {Object} 메모리 정보
     */
    estimateMemoryUsage(modelId) {
        const modelInfo = this.getModelInfo(modelId);
        const sizeInGB = {
            'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC': 0.6,
            'Llama-2-7b-chat-hf-q4f16_1-MLC': 4.0,
            'RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC': 2.0
        };

        return {
            modelSize: sizeInGB[modelId] || 1.0,
            estimatedRAM: (sizeInGB[modelId] || 1.0) * 1.5, // 모델 크기의 1.5배 추정
            modelInfo
        };
    }

    /**
     * 리소스 정리
     */
    async cleanup() {
        await this.unloadModel();
        this.loadingStartTime = null;
        
        if (this.isDevelopmentMode) {
            console.log('🧹 ModelManager 정리 완료');
        }
    }
}
