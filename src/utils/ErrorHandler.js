/**
 * 커스텀 에러 클래스들과 에러 핸들링 유틸리티
 * @module ErrorHandler
 * @version 1.0.0
 */

/**
 * 기본 계산기 에러 클래스
 */
export class CalculatorError extends Error {
    /**
     * @param {string} message - 에러 메시지
     * @param {string} type - 에러 타입
     * @param {string} recovery - 복구 방법
     */
    constructor(message, type, recovery) {
        super(message);
        this.name = 'CalculatorError';
        this.type = type;
        this.recovery = recovery;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * 모델 로딩 관련 에러
 */
export class ModelLoadError extends CalculatorError {
    constructor(message, modelId) {
        super(message, 'MODEL_LOAD_ERROR', 'try_development_mode');
        this.name = 'ModelLoadError';
        this.modelId = modelId;
    }
}

/**
 * 계산 실행 관련 에러
 */
export class CalculationError extends CalculatorError {
    constructor(message, problem) {
        super(message, 'CALCULATION_ERROR', 'retry_or_simplify');
        this.name = 'CalculationError';
        this.problem = problem;
    }
}

/**
 * UI 관련 에러
 */
export class UIError extends CalculatorError {
    constructor(message, element) {
        super(message, 'UI_ERROR', 'refresh_page');
        this.name = 'UIError';
        this.element = element;
    }
}

/**
 * 에러 핸들러 클래스
 */
export class ErrorHandler {
    /**
     * @param {boolean} isDevelopmentMode - 개발 모드 여부
     */
    constructor(isDevelopmentMode = false) {
        this.isDevelopmentMode = isDevelopmentMode;
        this.errorCount = 0;
        this.setupGlobalErrorHandler();
    }

    /**
     * 글로벌 에러 핸들러 설정
     */
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason);
        });
    }

    /**
     * 글로벌 에러 처리
     * @param {Error} error - 발생한 에러
     */
    handleGlobalError(error) {
        this.errorCount++;
        
        if (this.isDevelopmentMode) {
            console.error('🚨 Global Error:', error);
            console.trace();
        }

        // 사용자에게 친화적인 메시지 표시
        this.showUserFriendlyError(error);
    }

    /**
     * 에러 처리 및 복구 시도
     * @param {Error} error - 처리할 에러
     * @returns {Object} 처리 결과
     */
    handleError(error) {
        this.errorCount++;
        
        if (this.isDevelopmentMode) {
            console.error('🚨 Error:', error);
        }

        if (error instanceof ModelLoadError) {
            return this.handleModelLoadError(error);
        } else if (error instanceof CalculationError) {
            return this.handleCalculationError(error);
        } else if (error instanceof UIError) {
            return this.handleUIError(error);
        } else {
            return this.handleGenericError(error);
        }
    }

    /**
     * 모델 로딩 에러 처리
     */
    handleModelLoadError(error) {
        return {
            success: false,
            message: '모델 로딩에 실패했습니다. 개발 모드로 전환하여 계속 사용할 수 있습니다.',
            recovery: 'switch_to_dev_mode',
            error
        };
    }

    /**
     * 계산 에러 처리
     */
    handleCalculationError(error) {
        return {
            success: false,
            message: '계산 중 오류가 발생했습니다. 문제를 다시 확인하거나 간단하게 작성해주세요.',
            recovery: 'retry_or_simplify',
            error
        };
    }

    /**
     * UI 에러 처리
     */
    handleUIError(error) {
        return {
            success: false,
            message: 'UI 오류가 발생했습니다. 페이지를 새로고침해주세요.',
            recovery: 'refresh_page',
            error
        };
    }

    /**
     * 일반 에러 처리
     */
    handleGenericError(error) {
        return {
            success: false,
            message: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            recovery: 'retry',
            error
        };
    }

    /**
     * 사용자 친화적 에러 메시지 표시
     */
    showUserFriendlyError(error) {
        const errorMessages = {
            'MODEL_LOAD_ERROR': '🤖 AI 모델 로딩 실패\n개발 모드로 전환하여 계속 사용할 수 있습니다.',
            'CALCULATION_ERROR': '🧮 계산 실행 오류\n문제를 다시 확인하거나 간단하게 작성해주세요.',
            'UI_ERROR': '🎨 UI 오류\n페이지를 새로고침해주세요.',
            'NETWORK_ERROR': '🌐 네트워크 오류\n인터넷 연결을 확인해주세요.',
            'MEMORY_ERROR': '💾 메모리 부족\n다른 탭을 닫고 다시 시도해주세요.'
        };

        const message = error instanceof CalculatorError 
            ? errorMessages[error.type] || '알 수 없는 오류가 발생했습니다.'
            : '예상치 못한 오류가 발생했습니다.';

        // 에러 메시지를 UI에 표시 (간단한 toast 방식)
        this.showToast(message, 'error');
    }

    /**
     * 토스트 메시지 표시
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * 에러 통계 반환
     */
    getErrorStats() {
        return {
            totalErrors: this.errorCount,
            timestamp: new Date().toISOString()
        };
    }
}
