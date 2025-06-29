/**
 * Environment configuration and constants
 * @module Environment
 * @version 1.0.0
 */

export const CONFIG = {
    // DEVELOPMENT: {
    //     MOCK_AI_DELAY: 800,
    //     LOG_LEVEL: 'debug',
    //     ENABLE_PERFORMANCE_MONITORING: true,
    //     SHOW_DEBUG_INFO: true
    // },
    PRODUCTION: {
        MOCK_AI_DELAY: 0,
        LOG_LEVEL: 'error',
        ENABLE_PERFORMANCE_MONITORING: false,
        SHOW_DEBUG_INFO: false
    }
};

export const MODEL_CONFIG = {
    'TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC': {
        name: 'TinyLlama 1.1B',
        size: 'About 0.8GB',
        estimatedTime: '1-2 minutes',
        description: 'Stable and compatible lightweight model'
    },
    'Qwen2.5-0.5B-Instruct-q4f32_1-MLC': {
        name: 'Qwen2.5 0.5B',
        size: 'About 1.0GB',
        estimatedTime: '1-2 minutes',
        description: 'Ultra-fast compact model for quick responses'
    },
    'Qwen2.5-Math-1.5B-Instruct-q4f32_1-MLC': {
        name: 'Qwen2.5-Math 1.5B',
        size: 'About 1.9GB',
        estimatedTime: '2-3 minutes',
        description: 'Math-specialized model with better accuracy'
    },
    'Phi-3-mini-4k-instruct-q4f32_1-MLC': {
        name: 'Phi-3 Mini',
        size: 'About 5.5GB',
        estimatedTime: '4-5 minutes',
        description: 'High-quality Microsoft model with excellent reasoning'
    },
    'SmolLM2-1.7B-Instruct-q4f32_1-MLC': {
        name: 'SmolLM2 1.7B',
        size: 'About 2.7GB',
        estimatedTime: '2-3 minutes',
        description: 'Efficient small model with good performance'
    }
};

export const UI_CONFIG = {
    MAX_HISTORY_ITEMS: 10,
    ANIMATION_DURATION: 300,
    PROGRESS_UPDATE_INTERVAL: 100,
    STATUS_TYPES: {
        LOADING: 'loading',
        SUCCESS: 'success',
        ERROR: 'error',
        READY: 'ready'
    }
};

export const MATH_EXAMPLES = {
    basic: [
        "What is 123 plus 456?",
        "If you divide 3000 won among 3 people, how much does each get?",
        "What is 25 times 8?",
        "What is 84 divided by 12?",
        "What is 500 minus 185?"
    ],
    intermediate: [
        "If one apple costs 250 won, how much do 3 apples cost?",
        "What is 20% of 100?",
        "If 30 increases by 10%, what is the new value?",
        "How many minutes are there in 2 hours?",
        "If 12 candies are shared equally among 4 people, how many candies does each person get?"
    ],
    advanced: [
        "If you leave at 10 AM and the trip takes 3 hours, what time will you arrive?",
        "What is the area of a circle with a radius of 5 meters?",
        "Convert 2.5 kilometers to meters.",
        "What is the area of a square with a side length of 6 centimeters?",
        "If your salary is 2 million won and 10% is taken as tax, how much do you actually receive?"
    ]

};
