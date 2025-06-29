/**
 * Application Configuration
 * Centralized configuration for file paths and application settings
 */

export const AppConfig = {
    // File paths
    paths: {
        templates: 'templates/components.html',
        styles: 'styles/main.css'
    },
    
    // Template IDs
    templates: {
        status: 'status-template',
        modelSelection: 'model-selection-template', 
        inputSection: 'input-section-template',
        result: 'result-template',
        history: 'history-template',
        examples: 'examples-template'
    },
    
    // UI selectors
    selectors: {
        // Main container
        container: '.container',
        
        // Status elements
        status: '#status',
        statusText: '#statusText',
        progressContainer: '#progressContainer',
        progressBar: '#progressBar',
        progressText: '#progressText',
        timeEstimate: '#timeEstimate',
        
        // Model selection
        devModeToggle: '#devModeToggle',
        modelSelect: '#modelSelect',
        modelSelectSection: '#modelSelectSection',
        
        // Input elements
        mathInput: '#mathInput',
        calculateBtn: '#calculateBtn',
        clearBtn: '#clearBtn',
        testProgressBtn: '#testProgressBtn',
        
        // Result and history
        result: '#result',
        historySection: '#historySection',
        historyList: '#historyList',
        clearHistoryBtn: '#clearHistoryBtn',
        
        // Examples
        difficultySelect: '#difficultySelect',
        exampleButtons: '#exampleButtons'
    },
    
    // Application settings
    settings: {
        // Default model
        defaultModel: 'TinyLlama-1.1B-Chat-v0.4-q4f16_1-1k',
        
        // Progress update interval (ms)
        progressUpdateInterval: 100,
        
        // Mock calculation delay (ms)
        mockCalculationDelay: 1500,
        
        // History limit
        maxHistoryItems: 50,
        
        // Local storage keys
        storageKeys: {
            history: 'tinymath_history',
            devMode: 'tinymath_dev_mode',
            selectedModel: 'tinymath_selected_model'
        }
    }
};
