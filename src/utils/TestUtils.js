/**
 * 테스트 및 디버깅 유틸리티
 * @module TestUtils
 * @version 1.0.0
 */

/**
 * 시스템 테스트 및 디버깅 도구 클래스
 */
export class TestUtils {
    /**
     * @param {Object} calculator - 메인 계산기 인스턴스
     */
    constructor(calculator) {
        this.calculator = calculator;
        this.testResults = [];
    }

    /**
     * 전체 시스템 테스트 실행
     * @returns {Promise<Object>} 테스트 결과
     */
    async runSystemTest() {
        console.log('🧪 시스템 테스트 시작...');
        const startTime = Date.now();
        this.testResults = [];

        try {
            // 1. UI 요소 테스트
            await this.testUIElements();

            // 2. Mock AI 테스트
            await this.testMockAI();

            // 3. 히스토리 기능 테스트
            await this.testHistoryFunctions();

            // 4. 에러 핸들링 테스트
            await this.testErrorHandling();

            // 5. 성능 테스트
            await this.testPerformance();

            const duration = Date.now() - startTime;
            const passed = this.testResults.filter(r => r.passed).length;
            const total = this.testResults.length;

            const summary = {
                duration,
                total,
                passed,
                failed: total - passed,
                passRate: Math.round((passed / total) * 100),
                results: this.testResults
            };

            console.log('✅ 시스템 테스트 완료:', summary);
            this.displayTestResults(summary);

            return summary;

        } catch (error) {
            console.error('❌ 시스템 테스트 실패:', error);
            return {
                error: error.message,
                duration: Date.now() - startTime,
                results: this.testResults
            };
        }
    }

    /**
     * UI 요소 존재 여부 테스트
     */
    async testUIElements() {
        const requiredElements = [
            'mathInput', 'calculateBtn', 'result', 'status',
            'modelSelect', 'devModeToggle', 'historyList'
        ];

        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            this.addTestResult(
                `UI Element: ${elementId}`,
                !!element,
                element ? 'Element found' : 'Element missing'
            );
        }
    }

    /**
     * Mock AI 기능 테스트
     */
    async testMockAI() {
        if (!this.calculator.mockEngine) {
            this.addTestResult('Mock AI Engine', false, 'Mock engine not available');
            return;
        }

        const testCases = [
            { problem: '2 + 2', expected: '4' },
            { problem: '10 - 3', expected: '7' },
            { problem: '5 × 4', expected: '20' },
            { problem: '20 ÷ 4', expected: '5' }
        ];

        for (const testCase of testCases) {
            try {
                const result = await this.calculator.mockEngine.calculate(testCase.problem);
                const passed = result.includes(testCase.expected);
                
                this.addTestResult(
                    `Mock AI: ${testCase.problem}`,
                    passed,
                    passed ? `Correct result (${testCase.expected})` : `Unexpected result`
                );
            } catch (error) {
                this.addTestResult(
                    `Mock AI: ${testCase.problem}`,
                    false,
                    `Error: ${error.message}`
                );
            }
        }
    }

    /**
     * 히스토리 기능 테스트
     */
    async testHistoryFunctions() {
        if (!this.calculator.historyManager) {
            this.addTestResult('History Manager', false, 'History manager not available');
            return;
        }

        const initialCount = this.calculator.historyManager.history.length;

        // 히스토리 추가 테스트
        this.calculator.historyManager.addCalculation(
            'Test Problem',
            'Test Result',
            'Test Answer',
            true
        );

        const afterAdd = this.calculator.historyManager.history.length;
        this.addTestResult(
            'History Add',
            afterAdd === initialCount + 1,
            `History count: ${initialCount} → ${afterAdd}`
        );

        // 히스토리 통계 테스트
        const stats = this.calculator.historyManager.getStatistics();
        this.addTestResult(
            'History Statistics',
            typeof stats === 'object' && stats.total >= 0,
            `Statistics generated: total=${stats.total}`
        );
    }

    /**
     * 에러 핸들링 테스트
     */
    async testErrorHandling() {
        if (!this.calculator.errorHandler) {
            this.addTestResult('Error Handler', false, 'Error handler not available');
            return;
        }

        // 의도적으로 에러 발생시켜 처리 테스트
        try {
            const testError = new Error('Test error for handling');
            const result = this.calculator.errorHandler.handleError(testError);
            
            this.addTestResult(
                'Error Handling',
                !result.success && result.message,
                'Error properly handled'
            );
        } catch (error) {
            this.addTestResult(
                'Error Handling',
                false,
                `Error handler failed: ${error.message}`
            );
        }
    }

    /**
     * 성능 테스트
     */
    async testPerformance() {
        if (!this.calculator.performanceMonitor) {
            this.addTestResult('Performance Monitor', false, 'Performance monitor not available');
            return;
        }

        // 성능 통계 조회 테스트
        const stats = this.calculator.performanceMonitor.getPerformanceStats();
        this.addTestResult(
            'Performance Stats',
            typeof stats === 'object' && stats.uptime >= 0,
            `Stats generated, uptime: ${stats.uptime}ms`
        );

        // 메모리 사용량 조회 테스트
        const memory = this.calculator.performanceMonitor.getCurrentMemoryUsage();
        this.addTestResult(
            'Memory Usage',
            memory === null || (memory && memory.usedJSHeapSize >= 0),
            memory ? `Memory: ${memory.usedJSHeapSize}MB` : 'Memory info not available'
        );
    }

    /**
     * 진행률 바 테스트
     */
    testProgressBar() {
        console.log('📊 진행률 바 테스트 시작...');
        
        if (!this.calculator.uiManager) {
            console.error('❌ UI Manager를 찾을 수 없습니다.');
            return;
        }

        this.calculator.uiManager.testProgressAnimation();
        console.log('✅ 진행률 바 테스트 완료');
    }

    /**
     * 모델 테스트 (실제 AI 모델)
     */
    async testModel() {
        console.log('🤖 AI 모델 테스트 시작...');

        if (!this.calculator.modelManager) {
            console.error('❌ Model Manager를 찾을 수 없습니다.');
            return;
        }

        const status = this.calculator.modelManager.getModelStatus();
        console.log('📊 모델 상태:', status);

        if (status.isLoaded) {
            try {
                const testProblem = '2 + 2 = ?';
                console.log(`🧮 테스트 계산: ${testProblem}`);
                
                const result = await this.calculator.modelManager.calculate(testProblem);
                console.log('✅ 모델 테스트 성공:', result.substring(0, 100) + '...');
            } catch (error) {
                console.error('❌ 모델 테스트 실패:', error.message);
            }
        } else {
            console.log('ℹ️ 모델이 로드되지 않았습니다.');
        }
    }

    /**
     * 브라우저 호환성 테스트
     */
    testBrowserCompatibility() {
        console.log('🌐 브라우저 호환성 테스트...');

        const features = {
            'ES6 Classes': typeof class {} === 'function',
            'ES6 Modules': typeof window.importShim !== 'undefined' || 'import' in window,
            'Async/Await': (async function(){}).constructor.name === 'AsyncFunction',
            'Local Storage': typeof Storage !== 'undefined',
            'WebAssembly': typeof WebAssembly !== 'undefined',
            'Performance API': 'performance' in window,
            'Memory API': 'memory' in performance,
            'Connection API': 'connection' in navigator
        };

        console.table(features);

        const supported = Object.values(features).filter(Boolean).length;
        const total = Object.keys(features).length;
        
        console.log(`✅ 브라우저 호환성: ${supported}/${total} (${Math.round(supported/total*100)}%)`);
        
        return features;
    }

    /**
     * 메모리 사용량 스트레스 테스트
     */
    async stressTestMemory() {
        console.log('💾 메모리 스트레스 테스트 시작...');

        const initialMemory = this.calculator.performanceMonitor?.getCurrentMemoryUsage();
        console.log('📊 초기 메모리:', initialMemory);

        // 대량의 계산 히스토리 생성
        for (let i = 0; i < 100; i++) {
            this.calculator.historyManager?.addCalculation(
                `Stress test problem ${i}`,
                `Stress test result ${i}`,
                `${i}`,
                true
            );
        }

        const afterMemory = this.calculator.performanceMonitor?.getCurrentMemoryUsage();
        console.log('📊 테스트 후 메모리:', afterMemory);

        if (initialMemory && afterMemory) {
            const diff = afterMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
            console.log(`📈 메모리 변화: +${diff}MB`);
        }

        // 정리
        this.calculator.historyManager?.clearAllHistory();
        console.log('🧹 스트레스 테스트 정리 완료');
    }

    /**
     * 테스트 결과 추가
     * @param {string} name - 테스트 이름
     * @param {boolean} passed - 통과 여부
     * @param {string} message - 메시지
     */
    addTestResult(name, passed, message) {
        this.testResults.push({
            name,
            passed,
            message,
            timestamp: Date.now()
        });

        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${name}: ${message}`);
    }

    /**
     * 테스트 결과 UI에 표시
     * @param {Object} summary - 테스트 요약
     */
    displayTestResults(summary) {
        const resultElement = document.getElementById('result');
        if (!resultElement) return;

        const passRate = summary.passRate;
        const statusIcon = passRate >= 90 ? '🟢' : passRate >= 70 ? '🟡' : '🔴';

        resultElement.innerHTML = `
            <div class="test-results">
                <div class="test-header">
                    <h3>${statusIcon} 시스템 테스트 결과</h3>
                    <div class="test-summary">
                        <span class="test-duration">소요 시간: ${summary.duration}ms</span>
                        <span class="test-rate">통과율: ${passRate}%</span>
                    </div>
                </div>
                <div class="test-stats">
                    <div class="stat-item passed">통과: ${summary.passed}</div>
                    <div class="stat-item failed">실패: ${summary.failed}</div>
                    <div class="stat-item total">총합: ${summary.total}</div>
                </div>
                <div class="test-details">
                    ${summary.results.map(result => `
                        <div class="test-item ${result.passed ? 'passed' : 'failed'}">
                            <span class="test-icon">${result.passed ? '✅' : '❌'}</span>
                            <span class="test-name">${result.name}</span>
                            <span class="test-message">${result.message}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 성능 정보 조회 (글로벌 함수용)
     * @returns {Object} 성능 정보
     */
    getPerformanceInfo() {
        if (!this.calculator.performanceMonitor) {
            return { error: 'Performance monitor not available' };
        }

        return this.calculator.performanceMonitor.getPerformanceStats();
    }

    /**
     * 개발자 도구 명령어들을 글로벌 스코프에 등록
     */
    registerGlobalCommands() {
        // 전역 함수들 등록
        window.runSystemTest = () => this.runSystemTest();
        window.testProgress = () => this.testProgressBar();
        window.testModel = () => this.testModel();
        window.getPerformance = () => this.getPerformanceInfo();
        window.stressTest = () => this.stressTestMemory();
        window.browserTest = () => this.testBrowserCompatibility();
        
        // 계산기 인스턴스도 전역으로 노출
        window.calculator = this.calculator;

        console.log('🔧 개발자 명령어 등록 완료:');
        console.log('  • runSystemTest() - 전체 시스템 테스트');
        console.log('  • testProgress() - 진행률 바 테스트');
        console.log('  • testModel() - AI 모델 테스트');
        console.log('  • getPerformance() - 성능 정보 조회');
        console.log('  • stressTest() - 메모리 스트레스 테스트');
        console.log('  • browserTest() - 브라우저 호환성 테스트');
        console.log('  • calculator - 계산기 인스턴스 직접 접근');
    }
}
