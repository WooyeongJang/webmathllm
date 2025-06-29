/**
 * Mock AI 엔진 - 개발 및 테스트용 수학 계산기
 * @module MockEngine
 * @version 1.0.0
 */

import { CONFIG } from '../config/Environment.js';
import { CalculationError } from '../utils/ErrorHandler.js';

/**
 * Mock AI 계산 엔진
 */
export class MockEngine {
    /**
     * @param {boolean} isDevelopmentMode - 개발 모드 여부
     */
    constructor(isDevelopmentMode = false) {
        this.isDevelopmentMode = isDevelopmentMode;
        this.config = isDevelopmentMode ? CONFIG.DEVELOPMENT : CONFIG.PRODUCTION;
    }

    /**
     * 수학 문제 계산 (Mock AI)
     * @param {string} problem - 해결할 수학 문제
     * @returns {Promise<string>} 계산 결과
     */
    async calculate(problem) {
        try {
            // 개발 모드에서만 지연 시간 적용
            if (this.config.MOCK_AI_DELAY > 0) {
                await this.delay(this.config.MOCK_AI_DELAY);
            }

            const cleanProblem = problem.toLowerCase().trim();
            let result = '🤖 Mock AI 계산 결과:\n\n';

            // 기본 사칙연산
            if (this.isBasicArithmetic(cleanProblem)) {
                result += this.solveBasicArithmetic(cleanProblem);
            }
            // 백분율 계산
            else if (this.isPercentage(cleanProblem)) {
                result += this.solvePercentage(cleanProblem);
            }
            // 팩토리얼
            else if (this.isFactorial(cleanProblem)) {
                result += this.solveFactorial(cleanProblem);
            }
            // 제곱근
            else if (this.isSquareRoot(cleanProblem)) {
                result += this.solveSquareRoot(cleanProblem);
            }
            // 시간 변환
            else if (this.isTimeConversion(cleanProblem)) {
                result += this.solveTimeConversion(cleanProblem);
            }
            // 기하학 - 원의 넓이
            else if (this.isCircleArea(cleanProblem)) {
                result += this.solveCircleArea(cleanProblem);
            }
            // 방정식
            else if (this.isEquation(cleanProblem)) {
                result += this.solveEquation(cleanProblem);
            }
            // 복리 계산
            else if (this.isCompoundInterest(cleanProblem)) {
                result += this.solveCompoundInterest(cleanProblem);
            }
            // 일반적인 수식 계산 시도
            else {
                result += this.solveGeneral(cleanProblem);
            }

            result += '\n\n💡 이는 Mock AI의 결과입니다. 실제 AI 모델을 사용하려면 개발 모드를 해제하세요.';
            
            return result;
        } catch (error) {
            throw new CalculationError(
                `Mock AI 계산 중 오류 발생: ${error.message}`,
                problem
            );
        }
    }

    /**
     * 기본 사칙연산 감지
     */
    isBasicArithmetic(problem) {
        return /[\d\s\+\-\*×÷\/\(\)=\?]+/.test(problem) && 
               !problem.includes('%') && 
               !problem.includes('!');
    }

    /**
     * 기본 사칙연산 해결
     */
    solveBasicArithmetic(problem) {
        try {
            // 안전한 계산을 위해 기본적인 수식만 처리
            const mathExpression = problem
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/[=\?]/g, '')
                .replace(/[^0-9\+\-\*\/\(\)\.\s]/g, '');

            if (mathExpression.trim()) {
                const result = Function('"use strict"; return (' + mathExpression + ')')();
                return `🔢 계산 과정:\n${problem}\n\n✅ 답: ${result}`;
            }
        } catch (error) {
            return `⚠️ 기본 계산을 수행할 수 없습니다. 수식을 확인해주세요.\n예: 15 + 23, (25 + 15) × 3`;
        }
        return '❌ 올바른 수식 형태가 아닙니다.';
    }

    /**
     * 백분율 계산 감지 및 해결
     */
    isPercentage(problem) {
        return problem.includes('%') || problem.includes('percent');
    }

    solvePercentage(problem) {
        const match = problem.match(/(\d+)%\s*of\s*(\d+)/);
        if (match) {
            const percentage = parseInt(match[1]);
            const number = parseInt(match[2]);
            const result = (percentage / 100) * number;
            return `📊 백분율 계산:\n${percentage}% of ${number}\n= (${percentage} ÷ 100) × ${number}\n= ${result}`;
        }
        return '📊 백분율 계산 예: 30% of 120';
    }

    /**
     * 팩토리얼 계산
     */
    isFactorial(problem) {
        return problem.includes('!');
    }

    solveFactorial(problem) {
        const match = problem.match(/(\d+)!/);
        if (match) {
            const n = parseInt(match[1]);
            if (n <= 20) { // 안전한 범위
                let result = 1;
                let process = '';
                for (let i = 1; i <= n; i++) {
                    result *= i;
                    process += i + (i < n ? ' × ' : ' = ');
                }
                return `🔢 팩토리얼 계산:\n${n}! = ${process}${result}`;
            }
        }
        return '🔢 팩토리얼 계산 예: 5! (20 이하의 수만 지원)';
    }

    /**
     * 제곱근 계산
     */
    isSquareRoot(problem) {
        return problem.includes('√') || problem.includes('sqrt');
    }

    solveSquareRoot(problem) {
        const match = problem.match(/√(\d+)/) || problem.match(/sqrt\((\d+)\)/);
        if (match) {
            const number = parseInt(match[1]);
            const result = Math.sqrt(number);
            return `√ 제곱근 계산:\n√${number} = ${result}`;
        }
        return '√ 제곱근 계산 예: √144';
    }

    /**
     * 시간 변환
     */
    isTimeConversion(problem) {
        return problem.includes('시간') && problem.includes('분');
    }

    solveTimeConversion(problem) {
        const match = problem.match(/([\d\.]+)\s*시간/);
        if (match) {
            const hours = parseFloat(match[1]);
            const minutes = hours * 60;
            return `⏰ 시간 변환:\n${hours}시간 = ${hours} × 60분 = ${minutes}분`;
        }
        return '⏰ 시간 변환 예: 2.5시간을 분으로';
    }

    /**
     * 원의 넓이
     */
    isCircleArea(problem) {
        return problem.includes('원') && (problem.includes('넓이') || problem.includes('면적'));
    }

    solveCircleArea(problem) {
        const match = problem.match(/반지름\s*(\d+)/);
        if (match) {
            const radius = parseInt(match[1]);
            const area = Math.PI * radius * radius;
            return `🔵 원의 넓이:\n반지름 ${radius}인 원의 넓이\n= π × ${radius}² = π × ${radius * radius} ≈ ${area.toFixed(2)}`;
        }
        return '🔵 원의 넓이 예: 반지름 5인 원의 넓이';
    }

    /**
     * 방정식 해결
     */
    isEquation(problem) {
        return problem.includes('x') && problem.includes('=');
    }

    solveEquation(problem) {
        // 간단한 일차방정식: ax + b = c
        const match = problem.match(/(\d*)x\s*\+\s*(\d+)\s*=\s*(\d+)/);
        if (match) {
            const a = match[1] ? parseInt(match[1]) : 1;
            const b = parseInt(match[2]);
            const c = parseInt(match[3]);
            const x = (c - b) / a;
            return `📐 일차방정식 해결:\n${a}x + ${b} = ${c}\n${a}x = ${c} - ${b}\n${a}x = ${c - b}\nx = ${x}`;
        }
        return '📐 방정식 예: 2x + 5 = 15';
    }

    /**
     * 복리 계산
     */
    isCompoundInterest(problem) {
        return problem.includes('복리') || (problem.includes('원금') && problem.includes('%'));
    }

    solveCompoundInterest(problem) {
        const principalMatch = problem.match(/(\d+)만?원/);
        const rateMatch = problem.match(/(\d+)%/);
        const yearMatch = problem.match(/(\d+)년/);
        
        if (principalMatch && rateMatch && yearMatch) {
            const principal = parseInt(principalMatch[1]) * (principalMatch[0].includes('만') ? 10000 : 1);
            const rate = parseInt(rateMatch[1]) / 100;
            const years = parseInt(yearMatch[1]);
            const amount = principal * Math.pow(1 + rate, years);
            const interest = amount - principal;
            
            return `💰 복리 계산:\n원금: ${principal.toLocaleString()}원\n연이율: ${rateMatch[1]}%\n기간: ${years}년\n\n최종 금액: ${amount.toLocaleString()}원\n이자: ${interest.toLocaleString()}원`;
        }
        return '💰 복리 계산 예: 원금 100만원, 연 5%, 3년';
    }

    /**
     * 일반 수식 처리
     */
    solveGeneral(problem) {
        return `🤔 이 문제는 현재 Mock AI에서 지원하지 않는 유형입니다.\n\n지원하는 문제 유형:\n• 기본 사칙연산 (15 + 23)\n• 백분율 (30% of 120)\n• 팩토리얼 (8!)\n• 시간 변환 (2.5시간을 분으로)\n• 원의 넓이 (반지름 5인 원의 넓이)\n• 간단한 방정식 (2x + 5 = 15)\n\n더 복잡한 계산은 실제 AI 모델을 사용해주세요.`;
    }

    /**
     * 지연 함수
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
