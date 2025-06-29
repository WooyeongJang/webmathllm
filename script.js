/**
 * TinyMathLLM - 메인 애플리케이션 클래스
 * @module TinyMathLLM
 * @version 1.0.0
 * @author TinyMath Team
 */

// 외부 라이브러리
import * as webllm from "./web-llm/index.js";

// 내부 모듈들
import { CONFIG } from './src/config/Environment.js';
import { AppConfig } from './src/config/AppConfig.js';
import { ErrorHandler, CalculationError } from './src/utils/ErrorHandler.js';
import { MockEngine } from './src/core/MockEngine.js';
import { ModelManager } from './src/core/ModelManager.js';
import { UIManager } from './src/ui/UIManager.js';
import { HistoryManager } from './src/ui/HistoryManager.js';
import { ComponentLoader } from './src/ui/ComponentLoader.js';
import { PerformanceMonitor } from './src/utils/Performance.js';
import { TestUtils } from './src/utils/TestUtils.js';

/**
 * TinyMathLLM 메인 클래스
 * WebLLM을 활용한 브라우저 기반 AI 수학 계산기
 */
class TinyMathLLM {
    /**
     * 계산기 초기화
     */
    constructor() {
        // 개발 모드 감지
        this.isDevelopmentMode = this.detectDevelopmentMode();
        
        // 설정 로드
        this.config = this.isDevelopmentMode ? CONFIG.DEVELOPMENT : CONFIG.PRODUCTION;
        
        // 모듈 초기화
        this.initializeModules();
        
        // UI 및 이벤트 설정
        this.setupUI();
        this.setupEventListeners();
        
        // 개발자 도구 등록
        if (this.isDevelopmentMode) {
            this.testUtils.registerGlobalCommands();
        }
        
        // 초기 UI 설정만 수행 (모델 로딩 제거)
        this.setupInitialUI();
        
        if (this.isDevelopmentMode) {
            console.log('🧮 TinyMathLLM 초기화 완료');
        }
    }

    /**
     * 개발 모드 감지
     * @returns {boolean} 개발 모드 여부
     */
    detectDevelopmentMode() {
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' ||
               location.protocol === 'file:' ||
               window.location.search.includes('debug=true');
    }

    /**
     * 모듈들 초기화
     */
    initializeModules() {
        // 에러 핸들러 (가장 먼저 초기화)
        this.errorHandler = new ErrorHandler(this.isDevelopmentMode);
        
        // 성능 모니터
        this.performanceMonitor = new PerformanceMonitor(this.isDevelopmentMode);
        
        // UI 관리자
        this.uiManager = new UIManager(this.isDevelopmentMode);
        
        // 히스토리 관리자
        this.historyManager = new HistoryManager(this.isDevelopmentMode);
        
        // Mock AI 엔진
        this.mockEngine = new MockEngine(this.isDevelopmentMode);
        
        // 모델 관리자
        this.modelManager = new ModelManager(webllm, this.isDevelopmentMode);
        
        // 컴포넌트 로더
        this.componentLoader = new ComponentLoader();
        
        // 테스트 유틸리티
        this.testUtils = new TestUtils(this);
    }

    /**
     * UI 설정
     */
    setupUI() {
        try {
            // Initial status setup
            this.uiManager.updateStatus('Initializing system...', 'loading');
            
            // 예제 버튼 초기 설정
            this.uiManager.updateExampleButtons('basic');
            
            // 히스토리 표시
            this.historyManager.updateHistoryDisplay();
            
        } catch (error) {
            this.handleError(error, 'UI setup');
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        try {
            // 계산 버튼
            const calculateBtn = document.getElementById('calculateBtn');
            if (calculateBtn) {
                calculateBtn.addEventListener('click', () => this.calculateMath());
            }

            // Enter 키 이벤트
            const mathInput = document.getElementById('mathInput');
            if (mathInput) {
                mathInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !calculateBtn?.disabled) {
                        this.calculateMath();
                    }
                });
            }

            // 입력 초기화 버튼
            const clearBtn = document.getElementById('clearBtn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.uiManager.clearInput();
                    this.uiManager.clearResult();
                });
            }

            // 예제 버튼들
            const exampleButtons = document.getElementById('exampleButtons');
            if (exampleButtons) {
                exampleButtons.addEventListener('click', (e) => {
                    if (e.target.classList.contains('example-btn')) {
                        const example = e.target.dataset.example;
                        if (mathInput) {
                            mathInput.value = example;
                            mathInput.focus();
                        }
                    }
                });
            }

            // 난이도 선택
            const difficultySelect = document.getElementById('difficultySelect');
            if (difficultySelect) {
                difficultySelect.addEventListener('change', (e) => {
                    this.uiManager.updateExampleButtons(e.target.value);
                });
            }

            // 개발 모드 토글
            const devModeToggle = document.getElementById('devModeToggle');
            if (devModeToggle) {
                devModeToggle.addEventListener('change', (e) => {
                    this.uiManager.toggleDevelopmentMode(e.target.checked);
                });
            }

            // 모델 로딩 버튼
            const loadModelBtn = document.getElementById('loadModelBtn');
            if (loadModelBtn) {
                loadModelBtn.addEventListener('click', async () => {
                    await this.loadSelectedModel();
                });
            }

            // 모델 선택 변경 (자동 로딩 제거)
            const modelSelect = document.getElementById('modelSelect');
            if (modelSelect) {
                modelSelect.addEventListener('change', () => {
                    // Update status only when model changes (no auto-loading)
                    this.uiManager.updateStatus('🔄 Different model selected. Click "Load AI Model" button.', 'ready');
                });
            }

            // 히스토리 초기화 버튼
            const clearHistoryBtn = document.getElementById('clearHistoryBtn');
            if (clearHistoryBtn) {
                clearHistoryBtn.addEventListener('click', () => {
                    this.historyManager.clearAllHistory();
                });
            }

            // 진행률 테스트 버튼 (개발 모드용)
            const testProgressBtn = document.getElementById('testProgressBtn');
            if (testProgressBtn && this.isDevelopmentMode) {
                testProgressBtn.addEventListener('click', () => {
                    this.testUtils.testProgressBar();
                });
            }

        } catch (error) {
            this.handleError(error, 'Event listener setup');
        }
    }

    /**
     * 초기 UI 설정
     */
    setupInitialUI() {
        try {
            this.uiManager.updateStatus('Click "Load AI Model" button.', 'ready');
            this.uiManager.setInputEnabled(false);
            
            if (this.isDevelopmentMode) {
                console.log('🎯 초기 UI 설정 완료 - 수동 모델 로딩 모드');
            }
        } catch (error) {
            this.handleError(error, 'Initial UI setup');
        }
    }

    /**
     * 애플리케이션 초기화 (기존 함수 - 더 이상 자동 호출되지 않음)
     */
    async initializeApplication() {
        try {
            // 개발 모드가 체크되어 있으면 즉시 준비 완료
            if (this.uiManager.isDevelopmentModeEnabled()) {
                this.uiManager.updateStatus('🚀 개발 모드 준비 완료! Mock AI를 사용합니다.', 'success');
                this.uiManager.toggleDevelopmentMode(true);
            } else {
                // AI 모델 로딩 시작
                await this.loadSelectedModel();
            }

        } catch (error) {
            this.handleError(error, 'Application initialization');
        }
    }

    /**
     * 선택된 AI 모델 로딩
     */
    async loadSelectedModel() {
        const startTime = Date.now();
        
        try {
            const selectedModel = this.uiManager.getSelectedModel();
            if (!selectedModel) {
                throw new Error('모델이 선택되지 않았습니다.');
            }

            this.uiManager.updateStatus('Loading AI model...', 'loading');
            this.uiManager.setInputEnabled(false);

            // 진행률 콜백 함수
            const progressCallback = (progress) => {
                this.uiManager.updateProgress({
                    progress: progress.progress || 0,
                    timeRemaining: this.estimateTimeRemaining(progress, startTime)
                });
            };

            // 모델 로딩
            const engine = await this.modelManager.loadModel(selectedModel, progressCallback);
            
            const duration = Date.now() - startTime;
            this.performanceMonitor.recordModelLoading(selectedModel, duration, 'success');

            // 모델 예열
            await this.modelManager.warmupModel();

            this.uiManager.hideProgress();
            this.uiManager.updateStatus('🤖 AI model ready!', 'success');
            this.uiManager.setInputEnabled(true);

            if (this.isDevelopmentMode) {
                console.log(`✅ 모델 로딩 완료: ${(duration / 1000).toFixed(1)}초`);
            }

        } catch (error) {
            const duration = Date.now() - startTime;
            this.performanceMonitor.recordModelLoading(
                this.uiManager.getSelectedModel(), 
                duration, 
                'error'
            );

            this.handleError(error, 'Model loading');
            
            // 개발 모드로 대체 제안
            this.uiManager.updateStatus(
                '❌ 모델 로딩 실패. 개발 모드를 사용해보세요.',
                'error'
            );
            this.uiManager.setInputEnabled(true);
            this.uiManager.hideProgress();
        }
    }

    /**
     * 수학 문제 계산 실행
     */
    async calculateMath() {
        const startTime = Date.now();
        const problem = this.uiManager.getInputValue();

        if (!problem) {
            this.uiManager.showError('계산할 문제를 입력해주세요.');
            return;
        }

        try {
            this.uiManager.setInputEnabled(false);
            this.uiManager.showLoadingSpinner();
            this.uiManager.updateStatus('Calculating...', 'loading');

            let result;
            let isDevMode = this.uiManager.isDevelopmentModeEnabled();

            if (isDevMode) {
                // Mock AI 사용
                result = await this.mockEngine.calculate(problem);
            } else {
                // 실제 AI 모델 사용
                if (!this.modelManager.getModelStatus().isLoaded) {
                    throw new CalculationError('AI 모델이 로드되지 않았습니다.', problem);
                }
                result = await this.modelManager.calculate(problem);
            }

            const duration = Date.now() - startTime;
            this.performanceMonitor.recordCalculation(problem, duration, isDevMode, 'success');

            // Get selected model
            const selectedModel = this.uiManager.getSelectedModel();
            
            // 결과 표시
            this.uiManager.displayResult(result, problem, selectedModel);
            this.uiManager.updateStatus('✅ Calculation complete!', 'success');

            // 히스토리에 추가
            const finalAnswer = this.extractFinalAnswer(result);
            this.uiManager.addToHistory(problem, result, finalAnswer, selectedModel);
            this.historyManager.addCalculation(problem, result, finalAnswer, isDevMode);

        } catch (error) {
            const duration = Date.now() - startTime;
            this.performanceMonitor.recordCalculation(
                problem, 
                duration, 
                this.uiManager.isDevelopmentModeEnabled(), 
                'error'
            );

            this.handleError(error, 'Calculation');
        } finally {
            this.uiManager.setInputEnabled(true);
        }
    }

    /**
     * 최종 답안 추출
     * @param {string} result - 계산 결과
     * @returns {string} 추출된 최종 답안
     */
    extractFinalAnswer(result) {
        const answerPatterns = [
            /(?:답|answer|result|final answer)[:\s]*([^\n]+)/i,
            /✅\s*답:\s*([^\n]+)/i,
            /🎯\s*최종 답안:\s*([^\n]+)/i
        ];

        for (const pattern of answerPatterns) {
            const match = result.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return '';
    }

    /**
     * 남은 시간 추정
     * @param {Object} progress - 진행률 정보
     * @param {number} startTime - 시작 시간
     * @returns {number} 추정 남은 시간 (초)
     */
    estimateTimeRemaining(progress, startTime) {
        if (!progress.progress || progress.progress <= 0) {
            return null;
        }

        const elapsed = (Date.now() - startTime) / 1000;
        const estimated = elapsed / progress.progress;
        return Math.max(0, estimated - elapsed);
    }

    /**
     * 에러 처리
     * @param {Error} error - 발생한 에러
     * @param {string} context - 에러 발생 컨텍스트
     */
    handleError(error, context) {
        // 성능 모니터에 에러 기록
        this.performanceMonitor.recordError(error, context);
        
        // 에러 핸들러로 처리
        const result = this.errorHandler.handleError(error);
        
        // UI에 에러 표시
        this.uiManager.showError(result.message);
        
        if (this.isDevelopmentMode) {
            console.error(`❌ Error in ${context}:`, error);
        }
    }

    /**
     * 리소스 정리
     */
    async cleanup() {
        try {
            await this.modelManager?.cleanup();
            this.performanceMonitor?.cleanup();
            this.historyManager?.cleanup();
            this.uiManager?.cleanup();
            
            if (this.isDevelopmentMode) {
                console.log('🧹 TinyMath Calculator 정리 완료');
            }
        } catch (error) {
            console.error('정리 중 오류:', error);
        }
    }
}

// 페이지 로드 시 계산기 초기화
document.addEventListener('DOMContentLoaded', () => {
    try {
        const calculator = new TinyMathLLM();
        
        // 페이지 언로드 시 정리
        window.addEventListener('beforeunload', () => {
            calculator.cleanup();
        });
        
    } catch (error) {
        console.error('❌ 계산기 초기화 실패:', error);
        
        // 기본 에러 메시지 표시
        const statusEl = document.getElementById('statusText');
        if (statusEl) {
            statusEl.textContent = '계산기 초기화에 실패했습니다. 페이지를 새로고침해주세요.';
        }
    }
});
