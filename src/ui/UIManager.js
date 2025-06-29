/**
 * UI 상태 및 이벤트 관리 클래스
 * @module UIManager
 * @version 1.0.0
 */

import { UI_CONFIG, MATH_EXAMPLES } from '../config/Environment.js';
import { UIError } from '../utils/ErrorHandler.js';

/**
 * UI 요소들의 상태와 이벤트를 관리하는 클래스
 */
export class UIManager {
    /**
     * @param {boolean} isDevelopmentMode - 개발 모드 여부
     */
    constructor(isDevelopmentMode = false) {
        this.isDevelopmentMode = isDevelopmentMode;
        this.elements = {};
        this.currentDifficulty = 'basic';
        this.initializeElements();
    }

    /**
     * UI elements initialization
     */
    initializeElements() {
        const elementIds = [
            'status', 'statusText', 'progressContainer', 'progressBar', 
            'progressText', 'timeEstimate', 'mathInput', 'calculateBtn',
            'clearBtn', 'testProgressBtn', 'historySection',
            'historyList', 'clearHistoryBtn', 'modelSelect', 'devModeToggle',
            'modelSelectSection', 'showExamplesBtn', 'showHistoryBtn', 'resultModal', 'examplesModal', 'historyModal',
            'resultModalBody', 'examplesGrid',
            'closeResultBtn', 'closeExamplesBtn', 'closeHistoryBtn'
        ];

        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements[id] = element;
            } else if (this.isDevelopmentMode) {
                console.warn(`⚠️ UI element not found: ${id}`);
            }
        });

        // Initialize modal event handlers
        this.initializeModalHandlers();
        
        // Initialize examples modal content
        this.initializeExamplesModal();
    }

    /**
     * 상태 표시 업데이트
     * @param {string} message - 상태 메시지
     * @param {string} type - 상태 타입 (loading, success, error, ready)
     */
    updateStatus(message, type = 'ready') {
        try {
            if (this.elements.statusText) {
                this.elements.statusText.textContent = message;
            }
            
            if (this.elements.status) {
                this.elements.status.className = `status ${type}`;
            }
            
            // 로딩 스피너 제어
            const spinner = document.querySelector('.loading-spinner');
            if (spinner) {
                if (type === 'loading') {
                    spinner.style.display = 'inline-block';
                    spinner.classList.add('show');
                } else {
                    spinner.style.display = 'none';
                    spinner.classList.remove('show');
                }
            }
            
            if (this.isDevelopmentMode) {
                console.log(`📊 상태 업데이트: ${type} - ${message}`);
            }
        } catch (error) {
            throw new UIError('상태 업데이트 실패', 'status');
        }
    }

    /**
     * 진행률 표시 업데이트
     * @param {Object} progress - 진행률 정보
     */
    updateProgress(progress) {
        try {
            if (!this.elements.progressContainer || !this.elements.progressBar) {
                return;
            }

            // 진행률 컨테이너 표시
            this.elements.progressContainer.style.display = 'block';
            
            // 진행률 바 업데이트
            const percentage = Math.round(progress.progress * 100);
            this.elements.progressBar.style.width = `${percentage}%`;
            
            // 진행률 텍스트 업데이트
            if (this.elements.progressText) {
                this.elements.progressText.textContent = `${percentage}%`;
            }
            
            // 시간 예상 업데이트
            if (this.elements.timeEstimate && progress.timeRemaining) {
                this.elements.timeEstimate.textContent = this.formatTime(progress.timeRemaining);
            }

            if (this.isDevelopmentMode) {
                console.log(`📊 진행률: ${percentage}%`);
            }
        } catch (error) {
            throw new UIError('진행률 업데이트 실패', 'progress');
        }
    }

    /**
     * 진행률 숨기기
     */
    hideProgress() {
        if (this.elements.progressContainer) {
            this.elements.progressContainer.style.display = 'none';
        }
    }

    /**
     * Display calculation result in modal
     * @param {string} result - Calculation result
     * @param {string} problem - Original problem
     * @param {string} modelId - Model ID used for calculation
     */
    displayResult(result, problem, modelId = '') {
        try {
            if (!this.elements.resultModalBody) {
                throw new UIError('Result modal element not found', 'result');
            }

            const timestamp = new Date().toLocaleTimeString('en-US');
            const answerMatch = result.match(/(?:답|answer|result|final answer)[:\s]*([^\n]+)/i);
            const finalAnswer = answerMatch ? answerMatch[1].trim() : '';
            const usedModel = modelId || this.getSelectedModel();
            const modelDisplayName = this.getModelDisplayName(usedModel);

            this.elements.resultModalBody.innerHTML = `
<div class="result-container">
    <div class="result-header">
        <div class="result-meta">
            <span class="timestamp">
                <i class="icon">🕒</i> Completed: ${timestamp}
            </span>
            <div style="margin-top: 8px; font-weight: bold; color: #495057;">
                Problem: ${problem}
            </div>
            <div style="margin-top: 5px; font-size: 12px; color: #6c757d;">
                <i class="icon">🤖</i> Model: ${modelDisplayName}
            </div>
        </div>
    </div>
    <div class="result-content">
        ${result.replace(/\n/g, '<br>').trim()}
    </div>
    ${finalAnswer ? `
    <div class="final-answer">
        <strong>🎯 Final Answer: ${finalAnswer}</strong>
    </div>
    ` : ''}
</div>
            `.trim();

            // Show result modal
            this.showModal('resultModal');

        } catch (error) {
            throw new UIError('Failed to display result', 'result');
        }
    }

    /**
     * Input field state management
     * @param {boolean} enabled - Whether to enable input
     */
    setInputEnabled(enabled) {
        try {
            const elements = [
                this.elements.mathInput,
                this.elements.calculateBtn
            ];

            elements.forEach(element => {
                if (element) {
                    element.disabled = !enabled;
                }
            });

            // Update placeholder based on enabled state
            if (this.elements.mathInput) {
                if (enabled) {
                    this.elements.mathInput.placeholder = '';
                } else {
                    this.elements.mathInput.placeholder = 'Please load the AI model first';
                }
            }

            if (this.isDevelopmentMode) {
                console.log(`🎛️ Input state: ${enabled ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            throw new UIError('Failed to change input state', 'input');
        }
    }

    /**
     * 개발 모드 토글 처리
     * @param {boolean} isDevMode - 개발 모드 여부
     */
    toggleDevelopmentMode(isDevMode) {
        try {
            if (this.elements.modelSelectSection) {
                this.elements.modelSelectSection.style.display = isDevMode ? 'none' : 'block';
            }

            if (this.isDevelopmentMode) {
                console.log(`🔧 개발 모드: ${isDevMode ? '활성화' : '비활성화'}`);
            }
        } catch (error) {
            throw new UIError('개발 모드 토글 실패', 'devMode');
        }
    }

    /**
     * Update example buttons (deprecated - now using modal)
     * @param {string} difficulty - Difficulty level
     */
    updateExampleButtons(difficulty = 'basic') {
        // This function is deprecated since we're using modal now
        // But keeping it for compatibility
        this.currentDifficulty = difficulty;
        
        if (this.isDevelopmentMode) {
            console.log(`📝 Example buttons update: ${difficulty} (using modal now)`);
        }
    }

    /**
     * 입력 필드 초기화
     */
    clearInput() {
        if (this.elements.mathInput) {
            this.elements.mathInput.value = '';
            this.elements.mathInput.focus();
        }
    }

    /**
     * Clear result area (deprecated - now using modal)
     */
    clearResult() {
        // This function is deprecated since we're using modal now
        // Results are shown in modal and cleared when modal is closed
        if (this.isDevelopmentMode) {
            console.log('📝 Clear result (using modal now)');
        }
    }

    /**
     * 현재 입력 값 가져오기
     * @returns {string} 입력된 수학 문제
     */
    getInputValue() {
        return this.elements.mathInput ? this.elements.mathInput.value.trim() : '';
    }

    /**
     * 선택된 모델 ID 가져오기
     * @returns {string} 선택된 모델 ID
     */
    getSelectedModel() {
        return this.elements.modelSelect ? this.elements.modelSelect.value : '';
    }

    /**
     * 개발 모드 상태 확인
     * @returns {boolean} 개발 모드 여부
     */
    isDevelopmentModeEnabled() {
        return this.elements.devModeToggle ? this.elements.devModeToggle.checked : false;
    }

    /**
     * Show loading spinner in modal
     */
    showLoadingSpinner() {
        // Since we're using modals now, we can show a loading state in the status instead
        if (this.isDevelopmentMode) {
            console.log('📝 Loading spinner (handled by status now)');
        }
    }

    /**
     * 시간 포맷팅
     * @param {number} seconds - 초 단위 시간
     * @returns {string} 포맷된 시간 문자열
     */
    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.ceil(seconds)}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.ceil(seconds % 60);
            return `${minutes}m ${remainingSeconds}s`;
        }
    }

    /**
     * Show error message in modal
     * @param {string} message - Error message
     */
    showError(message) {
        this.updateStatus(message, 'error');
        
        if (this.elements.resultModalBody) {
            this.elements.resultModalBody.innerHTML = `
<div class="error-container" style="text-align: center; padding: 30px;">
    <div class="error-icon" style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
    <div class="error-message" style="color: #dc3545; font-size: 16px; font-weight: bold;">${message}</div>
</div>
            `.trim();
            this.showModal('resultModal');
        }
    }

    /**
     * 성공 메시지 표시
     * @param {string} message - 성공 메시지
     */
    showSuccess(message) {
        this.updateStatus(message, 'success');
    }

    /**
     * UI 요소 존재 여부 확인
     * @param {string} elementId - 확인할 요소 ID
     * @returns {boolean} 존재 여부
     */
    hasElement(elementId) {
        return !!this.elements[elementId];
    }

    /**
     * 진행률 테스트 애니메이션
     */
    testProgressAnimation() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 0.02;
            this.updateProgress({ 
                progress, 
                timeRemaining: (1 - progress) * 60 
            });
            
            if (progress >= 1) {
                clearInterval(interval);
                setTimeout(() => this.hideProgress(), 1000);
            }
        }, 100);
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        // 이벤트 리스너 정리는 상위 클래스에서 처리
        this.elements = {};
        
        if (this.isDevelopmentMode) {
            console.log('🧹 UIManager 정리 완료');
        }
    }

    /**
     * Initialize modal event handlers
     */
    initializeModalHandlers() {
        // Show examples button
        if (this.elements.showExamplesBtn) {
            this.elements.showExamplesBtn.addEventListener('click', () => {
                this.showModal('examplesModal');
            });
        }

        // Show history button
        if (this.elements.showHistoryBtn) {
            this.elements.showHistoryBtn.addEventListener('click', () => {
                this.updateHistoryModal();
                this.showModal('historyModal');
            });
        }

        // Clear history button (add global listener)
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all calculation history?')) {
                    this.clearAllHistory();
                    this.updateHistoryModal(); // Refresh the modal
                }
            });
        }

        // Close buttons for result modal
        if (this.elements.closeResultBtn) {
            this.elements.closeResultBtn.addEventListener('click', () => {
                this.hideModal('resultModal');
            });
        }

        // Close buttons for examples modal
        if (this.elements.closeExamplesBtn) {
            this.elements.closeExamplesBtn.addEventListener('click', () => {
                this.hideModal('examplesModal');
            });
        }

        // Close buttons for history modal
        if (this.elements.closeHistoryBtn) {
            this.elements.closeHistoryBtn.addEventListener('click', () => {
                this.hideModal('historyModal');
            });
        }

        // Close modals when clicking overlay
        [this.elements.resultModal, this.elements.examplesModal, this.elements.historyModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.hideModal(modal.id);
                    }
                });
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal('resultModal');
                this.hideModal('examplesModal');
                this.hideModal('historyModal');
            }
        });

        // Clear button event handler
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearInput();
            });
        }
    }

    /**
     * Initialize examples modal content
     */
    initializeExamplesModal() {
        if (!this.elements.examplesGrid) return;

        const categories = [
            { key: 'basic', title: '🔢 Basic (Arithmetic)', color: '#28a745' },
            { key: 'intermediate', title: '📊 Intermediate (Percentage, Equations)', color: '#ffc107' },
            { key: 'advanced', title: '🎯 Advanced (Geometry, Conversions)', color: '#dc3545' }
        ];

        this.elements.examplesGrid.innerHTML = categories.map(category => {
            const examples = MATH_EXAMPLES[category.key] || [];
            const exampleButtons = examples.map(example => 
                `<button class="example-btn" data-example="${example}" style="border-left: 4px solid ${category.color};">${example}</button>`
            ).join('');

            return `
<div class="example-category">
    <h4 style="color: ${category.color};">${category.title}</h4>
    ${exampleButtons}
</div>
            `.trim();
        }).join('');

        // Add event listeners to example buttons
        this.elements.examplesGrid.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const example = e.target.dataset.example;
                if (this.elements.mathInput) {
                    this.elements.mathInput.value = example;
                    this.elements.mathInput.focus();
                }
                // Auto-close examples modal when example is selected
                this.hideModal('examplesModal');
            });
        });
    }

    /**
     * Show modal
     * @param {string} modalId - Modal element ID
     */
    showModal(modalId) {
        const modal = this.elements[modalId];
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    /**
     * Hide modal
     * @param {string} modalId - Modal element ID
     */
    hideModal(modalId) {
        const modal = this.elements[modalId];
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    /**
     * Update history modal content
     */
    updateHistoryModal() {
        if (!this.elements.historyList) return;

        // Get history from localStorage
        const history = this.getHistoryFromStorage();

        if (history.length === 0) {
            this.elements.historyList.innerHTML = `
<div class="no-history" style="text-align: center; padding: 40px; color: #6c757d;">
    <div style="font-size: 48px; margin-bottom: 15px;">📝</div>
    <p style="font-size: 16px; margin-bottom: 8px;">No calculation history yet</p>
    <p style="font-size: 14px;">Start solving math problems to see your history!</p>
</div>
            `.trim();
            return;
        }

        // Render history items
        this.elements.historyList.innerHTML = history.map((item, index) => {
            const timestamp = new Date(item.timestamp).toLocaleString('en-US');
            const modelDisplayName = this.getModelDisplayName(item.modelId || 'Unknown Model');
            return `
<div class="history-item" style="border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 12px; background: white;">
    <div class="history-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <div class="history-problem" style="font-weight: bold; color: #495057; flex: 1; margin-right: 10px;">
            ${this.truncateText(item.problem, 60)}
        </div>
        <div class="history-time" style="font-size: 12px; color: #6c757d; white-space: nowrap;">
            ${timestamp}
        </div>
    </div>
    <div class="history-answer" style="background: #f8f9fa; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-size: 14px;">
        <strong>Answer: ${item.finalAnswer || 'Calculation completed'}</strong>
    </div>
    <div class="history-model" style="font-size: 11px; color: #6c757d; margin-bottom: 10px; text-align: center;">
        <i class="icon">🤖</i> ${modelDisplayName}
    </div>
    <div class="history-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
        <button class="reuse-btn" data-problem="${item.problem}" style="background: #17a2b8; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            🔄 Use Again
        </button>
        <button class="view-btn" data-index="${index}" style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            👁️ View Details
        </button>
        <button class="delete-btn" data-index="${index}" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            🗑️ Delete
        </button>
    </div>
</div>
            `.trim();
        }).join('');

        // Add event listeners to history action buttons
        this.attachHistoryEventListeners();
    }

    /**
     * Attach event listeners to history buttons
     */
    attachHistoryEventListeners() {
        if (!this.elements.historyList) return;

        // Reuse button
        this.elements.historyList.querySelectorAll('.reuse-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const problem = e.target.dataset.problem;
                if (this.elements.mathInput) {
                    this.elements.mathInput.value = problem;
                    this.elements.mathInput.focus();
                }
                this.hideModal('historyModal');
            });
        });

        // View details button
        this.elements.historyList.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const history = this.getHistoryFromStorage();
                const item = history[index];
                if (item) {
                    this.displayResult(item.result, item.problem, item.modelId);
                    this.hideModal('historyModal');
                }
            });
        });

        // Delete button
        this.elements.historyList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.deleteHistoryItem(index);
                this.updateHistoryModal(); // Refresh the modal
            });
        });
    }

    /**
     * Get history from localStorage
     * @returns {Array} History array
     */
    getHistoryFromStorage() {
        try {
            const stored = localStorage.getItem('tinymath_history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load history from storage:', error);
            return [];
        }
    }

    /**
     * Save history to localStorage
     * @param {Array} history - History array to save
     */
    saveHistoryToStorage(history) {
        try {
            localStorage.setItem('tinymath_history', JSON.stringify(history));
        } catch (error) {
            console.warn('Failed to save history to storage:', error);
        }
    }

    /**
     * Add calculation to history
     * @param {string} problem - Math problem
     * @param {string} result - Calculation result
     * @param {string} finalAnswer - Final answer extracted from result
     * @param {string} modelId - Model ID used for calculation
     */
    addToHistory(problem, result, finalAnswer = '', modelId = '') {
        const history = this.getHistoryFromStorage();
        const newItem = {
            problem: problem.trim(),
            result,
            finalAnswer: finalAnswer || this.extractFinalAnswer(result),
            modelId: modelId || this.getSelectedModel(),
            timestamp: new Date().toISOString()
        };

        // Add to beginning of array
        history.unshift(newItem);

        // Keep only last 50 items
        if (history.length > 50) {
            history.splice(50);
        }

        this.saveHistoryToStorage(history);
    }

    /**
     * Extract final answer from result text
     * @param {string} result - Full calculation result
     * @returns {string} Extracted final answer
     */
    extractFinalAnswer(result) {
        const answerMatch = result.match(/(?:답|answer|result|final answer)[:\s]*([^\n]+)/i);
        return answerMatch ? answerMatch[1].trim() : 'Calculation completed';
    }

    /**
     * Delete a history item
     * @param {number} index - Index of item to delete
     */
    deleteHistoryItem(index) {
        const history = this.getHistoryFromStorage();
        if (index >= 0 && index < history.length) {
            history.splice(index, 1);
            this.saveHistoryToStorage(history);
        }
    }

    /**
     * Clear all history
     */
    clearAllHistory() {
        this.saveHistoryToStorage([]);
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Get user-friendly model display name
     * @param {string} modelId - Model ID
     * @returns {string} Display name
     */
    getModelDisplayName(modelId) {
        const modelNames = {
            'TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC': 'TinyLlama 1.1B',
            'Qwen2.5-0.5B-Instruct-q4f32_1-MLC': 'Qwen2.5 0.5B',
            'Qwen2.5-Math-1.5B-Instruct-q4f32_1-MLC': 'Qwen2.5-Math 1.5B',
            'Phi-3-mini-4k-instruct-q4f32_1-MLC': 'Phi-3 Mini',
            'SmolLM2-1.7B-Instruct-q4f32_1-MLC': 'SmolLM2 1.7B'
        };
        
        return modelNames[modelId] || modelId.replace(/-q4f32_1-MLC$/, '').replace(/-/g, ' ');
    }
}
