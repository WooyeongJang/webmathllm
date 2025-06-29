/**
 * 계산 히스토리 관리 클래스
 * @module HistoryManager
 * @version 1.0.0
 */

import { UI_CONFIG } from '../config/Environment.js';

/**
 * 계산 히스토리의 저장, 관리, 표시를 담당하는 클래스
 */
export class HistoryManager {
    /**
     * @param {boolean} isDevelopmentMode - 개발 모드 여부
     */
    constructor(isDevelopmentMode = false) {
        this.isDevelopmentMode = isDevelopmentMode;
        this.history = [];
        this.maxItems = UI_CONFIG.MAX_HISTORY_ITEMS;
        this.storageKey = 'tinymath_calculator_history';
        
        this.historyListElement = document.getElementById('historyList');
        this.historySectionElement = document.getElementById('historySection');
        
        this.loadHistoryFromStorage();
    }

    /**
     * 새로운 계산 결과를 히스토리에 추가
     * @param {string} problem - 수학 문제
     * @param {string} result - 계산 결과
     * @param {string} finalAnswer - 최종 답안 (추출된 답)
     * @param {boolean} isDevMode - 개발 모드 계산 여부
     */
    addCalculation(problem, result, finalAnswer = '', isDevMode = false) {
        try {
            const historyItem = {
                id: Date.now(),
                problem: problem.trim(),
                result,
                finalAnswer,
                timestamp: new Date().toISOString(),
                displayTime: new Date().toLocaleTimeString('ko-KR'),
                isDevMode,
                duration: null // 계산 시간은 추후 추가 가능
            };

            // 맨 앞에 추가
            this.history.unshift(historyItem);

            // 최대 개수 제한
            if (this.history.length > this.maxItems) {
                this.history = this.history.slice(0, this.maxItems);
            }

            // 로컬 스토리지에 저장
            this.saveHistoryToStorage();

            // UI 업데이트
            this.updateHistoryDisplay();

            if (this.isDevelopmentMode) {
                console.log('📚 히스토리 추가:', { problem, isDevMode });
            }

        } catch (error) {
            if (this.isDevelopmentMode) {
                console.error('❌ 히스토리 추가 실패:', error);
            }
        }
    }

    /**
     * 히스토리 UI 업데이트
     */
    updateHistoryDisplay() {
        try {
            if (!this.historyListElement) {
                return;
            }

            if (this.history.length === 0) {
                this.historyListElement.innerHTML = `
                    <div class="no-history">
                        <p>아직 계산 기록이 없습니다.</p>
                        <p>수학 문제를 계산해보세요! 🧮</p>
                    </div>
                `;
                
                if (this.historySectionElement) {
                    this.historySectionElement.style.display = 'none';
                }
                return;
            }

            // 히스토리 섹션 표시
            if (this.historySectionElement) {
                this.historySectionElement.style.display = 'block';
            }

            // 히스토리 아이템들 렌더링
            this.historyListElement.innerHTML = this.history.map(item => 
                this.renderHistoryItem(item)
            ).join('');

            // 각 히스토리 아이템에 클릭 이벤트 추가
            this.attachHistoryItemEvents();

        } catch (error) {
            if (this.isDevelopmentMode) {
                console.error('❌ 히스토리 표시 실패:', error);
            }
        }
    }

    /**
     * 개별 히스토리 아이템 렌더링
     * @param {Object} item - 히스토리 아이템
     * @returns {string} 렌더링된 HTML
     */
    renderHistoryItem(item) {
        const modeIcon = item.isDevMode ? '🚀' : '🤖';
        const modeText = item.isDevMode ? 'Mock AI' : 'AI Model';
        
        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-header">
                    <div class="history-problem" title="${item.problem}">
                        ${this.truncateText(item.problem, 50)}
                    </div>
                    <div class="history-meta">
                        <span class="history-mode" title="${modeText}">
                            ${modeIcon}
                        </span>
                        <span class="history-time" title="${item.timestamp}">
                            ${item.displayTime}
                        </span>
                    </div>
                </div>
                <div class="history-answer">
                    <strong>${item.finalAnswer || '계산 완료'}</strong>
                </div>
                <div class="history-actions">
                    <button class="history-action-btn reuse-btn" 
                            data-action="reuse" 
                            data-problem="${item.problem}"
                            title="문제 다시 사용">
                        🔄
                    </button>
                    <button class="history-action-btn view-btn" 
                            data-action="view" 
                            data-id="${item.id}"
                            title="결과 상세 보기">
                        👁️
                    </button>
                    <button class="history-action-btn delete-btn" 
                            data-action="delete" 
                            data-id="${item.id}"
                            title="삭제">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 히스토리 아이템 이벤트 연결
     */
    attachHistoryItemEvents() {
        if (!this.historyListElement) return;

        this.historyListElement.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            
            if (action === 'reuse') {
                this.reuseHistoryItem(e.target.dataset.problem);
            } else if (action === 'view') {
                this.viewHistoryItem(e.target.dataset.id);
            } else if (action === 'delete') {
                this.deleteHistoryItem(e.target.dataset.id);
            }
        });
    }

    /**
     * 히스토리 아이템 재사용 (문제를 입력 필드에 복사)
     * @param {string} problem - 재사용할 문제
     */
    reuseHistoryItem(problem) {
        const mathInput = document.getElementById('mathInput');
        if (mathInput) {
            mathInput.value = problem;
            mathInput.focus();
            
            if (this.isDevelopmentMode) {
                console.log('🔄 문제 재사용:', problem);
            }
        }
    }

    /**
     * 히스토리 아이템 상세 보기
     * @param {string} itemId - 히스토리 아이템 ID
     */
    viewHistoryItem(itemId) {
        const item = this.history.find(h => h.id == itemId);
        if (!item) return;

        const resultElement = document.getElementById('result');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="result-container history-view">
                    <div class="result-header">
                        <h3>📚 히스토리 상세 보기</h3>
                        <div class="result-meta">
                            <span class="timestamp">
                                <i class="icon">🕒</i> ${item.displayTime}
                            </span>
                            <span class="mode-badge ${item.isDevMode ? 'dev-mode' : 'ai-mode'}">
                                ${item.isDevMode ? '🚀 Mock AI' : '🤖 AI Model'}
                            </span>
                        </div>
                    </div>
                    <div class="history-problem-display">
                        <strong>문제:</strong> ${item.problem}
                    </div>
                    <div class="result-content">
                        ${item.result.replace(/\n/g, '<br>')}
                    </div>
                    ${item.finalAnswer ? `
                        <div class="final-answer">
                            <strong>🎯 최종 답안: ${item.finalAnswer}</strong>
                        </div>
                    ` : ''}
                </div>
            `;
            
            resultElement.scrollIntoView({ behavior: 'smooth' });
            
            if (this.isDevelopmentMode) {
                console.log('👁️ 히스토리 상세 보기:', item.problem);
            }
        }
    }

    /**
     * 히스토리 아이템 삭제
     * @param {string} itemId - 삭제할 아이템 ID
     */
    deleteHistoryItem(itemId) {
        try {
            this.history = this.history.filter(item => item.id != itemId);
            this.saveHistoryToStorage();
            this.updateHistoryDisplay();
            
            if (this.isDevelopmentMode) {
                console.log('🗑️ 히스토리 삭제:', itemId);
            }
        } catch (error) {
            if (this.isDevelopmentMode) {
                console.error('❌ 히스토리 삭제 실패:', error);
            }
        }
    }

    /**
     * 전체 히스토리 삭제
     */
    clearAllHistory() {
        try {
            this.history = [];
            this.saveHistoryToStorage();
            this.updateHistoryDisplay();
            
            if (this.isDevelopmentMode) {
                console.log('🧹 전체 히스토리 삭제');
            }
        } catch (error) {
            if (this.isDevelopmentMode) {
                console.error('❌ 히스토리 초기화 실패:', error);
            }
        }
    }

    /**
     * 로컬 스토리지에서 히스토리 불러오기
     */
    loadHistoryFromStorage() {
        try {
            const savedHistory = localStorage.getItem(this.storageKey);
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
                
                // 유효성 검사 및 정리
                this.history = this.history.filter(item => 
                    item && item.problem && item.result && item.timestamp
                );
                
                if (this.isDevelopmentMode) {
                    console.log('📚 히스토리 로드:', this.history.length, '개 아이템');
                }
            }
        } catch (error) {
            if (this.isDevelopmentMode) {
                console.warn('⚠️ 히스토리 로드 실패, 초기화:', error);
            }
            this.history = [];
        }
    }

    /**
     * 로컬 스토리지에 히스토리 저장
     */
    saveHistoryToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (error) {
            if (this.isDevelopmentMode) {
                console.error('❌ 히스토리 저장 실패:', error);
            }
        }
    }

    /**
     * 텍스트 말줄임 처리
     * @param {string} text - 원본 텍스트
     * @param {number} maxLength - 최대 길이
     * @returns {string} 잘린 텍스트
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }

    /**
     * 히스토리 통계 반환
     * @returns {Object} 히스토리 통계
     */
    getStatistics() {
        const total = this.history.length;
        const devModeCount = this.history.filter(item => item.isDevMode).length;
        const aiModeCount = total - devModeCount;
        
        return {
            total,
            devModeCount,
            aiModeCount,
            oldestItem: this.history[this.history.length - 1],
            newestItem: this.history[0]
        };
    }

    /**
     * 히스토리 내보내기 (JSON 형태)
     * @returns {string} JSON 문자열
     */
    exportHistory() {
        return JSON.stringify(this.history, null, 2);
    }

    /**
     * 히스토리 가져오기 (JSON 형태)
     * @param {string} jsonString - 가져올 JSON 문자열
     */
    importHistory(jsonString) {
        try {
            const importedHistory = JSON.parse(jsonString);
            if (Array.isArray(importedHistory)) {
                this.history = importedHistory.slice(0, this.maxItems);
                this.saveHistoryToStorage();
                this.updateHistoryDisplay();
                
                if (this.isDevelopmentMode) {
                    console.log('📥 히스토리 가져오기 완료:', this.history.length, '개 아이템');
                }
            }
        } catch (error) {
            if (this.isDevelopmentMode) {
                console.error('❌ 히스토리 가져오기 실패:', error);
            }
        }
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        this.history = [];
        this.historyListElement = null;
        this.historySectionElement = null;
        
        if (this.isDevelopmentMode) {
            console.log('🧹 HistoryManager 정리 완료');
        }
    }
}
