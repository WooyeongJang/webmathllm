/**
 * 성능 모니터링 및 시스템 정보 유틸리티
 * @module Performance
 * @version 1.0.0
 */

/**
 * 성능 모니터링 클래스
 */
export class PerformanceMonitor {
    /**
     * @param {boolean} isDevelopmentMode - 개발 모드 여부
     */
    constructor(isDevelopmentMode = false) {
        this.isDevelopmentMode = isDevelopmentMode;
        this.metrics = {
            calculations: [],
            modelLoading: [],
            memoryUsage: [],
            errors: []
        };
        this.startTime = Date.now();
        
        if (this.isDevelopmentMode) {
            this.startPerformanceMonitoring();
        }
    }

    /**
     * 성능 모니터링 시작
     */
    startPerformanceMonitoring() {
        // 메모리 사용량 주기적 수집
        this.memoryInterval = setInterval(() => {
            this.recordMemoryUsage();
        }, 5000); // 5초마다

        if (this.isDevelopmentMode) {
            console.log('📊 성능 모니터링 시작');
        }
    }

    /**
     * 계산 성능 기록
     * @param {string} problem - 계산 문제
     * @param {number} duration - 계산 시간 (ms)
     * @param {boolean} isDevMode - 개발 모드 여부
     * @param {string} status - 계산 상태 (success, error)
     */
    recordCalculation(problem, duration, isDevMode, status = 'success') {
        const record = {
            timestamp: Date.now(),
            problem: problem.substring(0, 50), // 개인정보 보호를 위해 일부만 저장
            duration,
            isDevMode,
            status,
            memoryUsage: this.getCurrentMemoryUsage()
        };

        this.metrics.calculations.push(record);
        
        // 최근 100개만 유지
        if (this.metrics.calculations.length > 100) {
            this.metrics.calculations = this.metrics.calculations.slice(-100);
        }

        if (this.isDevelopmentMode) {
            console.log('⏱️ 계산 성능 기록:', {
                duration: `${duration}ms`,
                mode: isDevMode ? 'Mock AI' : 'AI Model',
                status
            });
        }
    }

    /**
     * 모델 로딩 성능 기록
     * @param {string} modelId - 모델 ID
     * @param {number} duration - 로딩 시간 (ms)
     * @param {string} status - 로딩 상태
     * @param {number} modelSize - 모델 크기 (MB)
     */
    recordModelLoading(modelId, duration, status, modelSize = 0) {
        const record = {
            timestamp: Date.now(),
            modelId,
            duration,
            status,
            modelSize,
            memoryUsage: this.getCurrentMemoryUsage()
        };

        this.metrics.modelLoading.push(record);
        
        // 최근 20개만 유지
        if (this.metrics.modelLoading.length > 20) {
            this.metrics.modelLoading = this.metrics.modelLoading.slice(-20);
        }

        if (this.isDevelopmentMode) {
            console.log('🤖 모델 로딩 성능 기록:', {
                model: modelId,
                duration: `${(duration / 1000).toFixed(1)}s`,
                status,
                size: `${modelSize}MB`
            });
        }
    }

    /**
     * 에러 기록
     * @param {Error} error - 발생한 에러
     * @param {string} context - 에러 발생 컨텍스트
     */
    recordError(error, context) {
        const record = {
            timestamp: Date.now(),
            type: error.constructor.name,
            message: error.message,
            context,
            stack: this.isDevelopmentMode ? error.stack : null,
            memoryUsage: this.getCurrentMemoryUsage()
        };

        this.metrics.errors.push(record);
        
        // 최근 50개만 유지
        if (this.metrics.errors.length > 50) {
            this.metrics.errors = this.metrics.errors.slice(-50);
        }

        if (this.isDevelopmentMode) {
            console.log('❌ 에러 기록:', {
                type: error.constructor.name,
                context,
                message: error.message
            });
        }
    }

    /**
     * 메모리 사용량 기록
     */
    recordMemoryUsage() {
        const usage = this.getCurrentMemoryUsage();
        if (usage) {
            this.metrics.memoryUsage.push({
                timestamp: Date.now(),
                ...usage
            });

            // 최근 100개만 유지
            if (this.metrics.memoryUsage.length > 100) {
                this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
            }
        }
    }

    /**
     * 현재 메모리 사용량 조회
     * @returns {Object|null} 메모리 사용량 정보
     */
    getCurrentMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return {
                usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
                totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
                jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
            };
        }
        return null;
    }

    /**
     * 브라우저 정보 수집
     * @returns {Object} 브라우저 정보
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        return {
            userAgent: ua,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            connection: connection ? {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt
            } : null,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }

    /**
     * 성능 통계 계산
     * @returns {Object} 성능 통계
     */
    getPerformanceStats() {
        const calculations = this.metrics.calculations;
        const modelLoading = this.metrics.modelLoading;
        const errors = this.metrics.errors;
        const memoryUsage = this.metrics.memoryUsage;

        // 계산 성능 통계
        const calcStats = calculations.length > 0 ? {
            total: calculations.length,
            successful: calculations.filter(c => c.status === 'success').length,
            failed: calculations.filter(c => c.status === 'error').length,
            avgDuration: calculations.reduce((sum, c) => sum + c.duration, 0) / calculations.length,
            devModeCount: calculations.filter(c => c.isDevMode).length,
            aiModeCount: calculations.filter(c => !c.isDevMode).length
        } : null;

        // 모델 로딩 통계
        const modelStats = modelLoading.length > 0 ? {
            total: modelLoading.length,
            successful: modelLoading.filter(m => m.status === 'success').length,
            failed: modelLoading.filter(m => m.status === 'error').length,
            avgDuration: modelLoading.reduce((sum, m) => sum + m.duration, 0) / modelLoading.length
        } : null;

        // 메모리 통계
        const memoryStats = memoryUsage.length > 0 ? {
            current: this.getCurrentMemoryUsage(),
            peak: Math.max(...memoryUsage.map(m => m.usedJSHeapSize)),
            average: memoryUsage.reduce((sum, m) => sum + m.usedJSHeapSize, 0) / memoryUsage.length
        } : null;

        return {
            uptime: Date.now() - this.startTime,
            browserInfo: this.getBrowserInfo(),
            calculations: calcStats,
            modelLoading: modelStats,
            memory: memoryStats,
            errors: {
                total: errors.length,
                recent: errors.slice(-5)
            }
        };
    }

    /**
     * 성능 리포트 생성
     * @returns {string} 성능 리포트 (텍스트)
     */
    generatePerformanceReport() {
        const stats = this.getPerformanceStats();
        const uptime = Math.round(stats.uptime / 1000 / 60); // 분 단위

        let report = `
🔍 TinyMath Calculator 성능 리포트
════════════════════════════════════

⏱️ 시스템 정보
• 가동 시간: ${uptime}분
• 브라우저: ${this.getBrowserName(stats.browserInfo.userAgent)}
• 플랫폼: ${stats.browserInfo.platform}
• CPU 코어: ${stats.browserInfo.hardwareConcurrency || 'N/A'}
• 디바이스 메모리: ${stats.browserInfo.deviceMemory || 'N/A'}GB

💾 메모리 사용량
`;

        if (stats.memory) {
            report += `• 현재 사용량: ${stats.memory.current?.usedJSHeapSize || 'N/A'}MB
• 최대 사용량: ${stats.memory.peak}MB
• 평균 사용량: ${Math.round(stats.memory.average)}MB
• 힙 크기 제한: ${stats.memory.current?.jsHeapSizeLimit || 'N/A'}MB
`;
        } else {
            report += `• 메모리 정보를 사용할 수 없습니다.
`;
        }

        if (stats.calculations) {
            report += `
🧮 계산 성능
• 총 계산 수: ${stats.calculations.total}
• 성공: ${stats.calculations.successful} | 실패: ${stats.calculations.failed}
• 평균 계산 시간: ${Math.round(stats.calculations.avgDuration)}ms
• Mock AI 사용: ${stats.calculations.devModeCount}
• AI 모델 사용: ${stats.calculations.aiModeCount}
`;
        }

        if (stats.modelLoading) {
            report += `
🤖 모델 로딩 성능
• 총 로딩 시도: ${stats.modelLoading.total}
• 성공: ${stats.modelLoading.successful} | 실패: ${stats.modelLoading.failed}
• 평균 로딩 시간: ${Math.round(stats.modelLoading.avgDuration / 1000)}초
`;
        }

        if (stats.errors.total > 0) {
            report += `
❌ 에러 통계
• 총 에러 수: ${stats.errors.total}
• 최근 에러: ${stats.errors.recent.map(e => e.type).join(', ')}
`;
        }

        report += `
════════════════════════════════════
📊 리포트 생성 시간: ${new Date().toLocaleString('ko-KR')}
`;

        return report;
    }

    /**
     * 브라우저 이름 추출
     * @param {string} userAgent - User Agent 문자열
     * @returns {string} 브라우저 이름
     */
    getBrowserName(userAgent) {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    /**
     * 성능 데이터 내보내기
     * @returns {Object} 전체 성능 데이터
     */
    exportData() {
        return {
            metrics: this.metrics,
            stats: this.getPerformanceStats(),
            exportTime: new Date().toISOString()
        };
    }

    /**
     * 성능 데이터 초기화
     */
    clearMetrics() {
        this.metrics = {
            calculations: [],
            modelLoading: [],
            memoryUsage: [],
            errors: []
        };

        if (this.isDevelopmentMode) {
            console.log('🧹 성능 데이터 초기화');
        }
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        if (this.memoryInterval) {
            clearInterval(this.memoryInterval);
            this.memoryInterval = null;
        }

        this.clearMetrics();

        if (this.isDevelopmentMode) {
            console.log('🧹 PerformanceMonitor 정리 완료');
        }
    }
}
