class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement
        this.currentOperandTextElement = currentOperandTextElement
        this.clear()
    }

    clear() {
        this.currentOperand = ''
        this.previousOperand = ''
        this.operation = undefined
        this.shouldReset = false
    }

    delete() {
        if (this.isError()) {
            this.clear()
            return
        }
        this.shouldReset = false
        this.currentOperand = this.currentOperand.toString().slice(0, -1)
    }

    appendNumber(number) {
        if (this.isError() || this.shouldReset) {
            this.currentOperand = ''
            this.shouldReset = false
        }
        if (number === '.' && this.currentOperand.includes('.')) return
        if (number === '.' && this.currentOperand === '') {
            this.currentOperand = '0.'
            return
        }
        this.currentOperand = this.currentOperand.toString() + number.toString()
    }

    chooseOperation(operation) {
        if (this.isError()) this.clear()
        if (this.currentOperand === '' && this.previousOperand === '') return
        if (this.currentOperand === '' && this.previousOperand !== '') {
            this.operation = operation
            return
        }
        if (this.previousOperand !== '') {
            this.compute()
            if (this.isError()) return
        }
        this.operation = operation
        this.previousOperand = this.currentOperand
        this.currentOperand = ''
        this.shouldReset = false
    }

    compute() {
        const prev = parseFloat(this.previousOperand)
        const current = parseFloat(this.currentOperand)
        if (isNaN(prev) || isNaN(current) || this.operation == null) return

        let computation
        switch (this.operation) {
            case '+':
                computation = prev + current
                break
            case '-':
                computation = prev - current
                break
            case '*':
                computation = prev * current
                break
            case '÷':
                computation = prev / current
                break
            default:
                return
        }

        if (!Number.isFinite(computation)) {
            this.currentOperand = 'Error'
            this.previousOperand = ''
            this.operation = undefined
            this.shouldReset = false
            return
        }

        this.currentOperand = this.roundResult(computation)
        this.operation = undefined
        this.previousOperand = ''
        this.shouldReset = true
    }

    roundResult(value) {
        return parseFloat(value.toPrecision(12)).toString()
    }

    isError() {
        return this.currentOperand === 'Error'
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString()
        if (stringNumber === '') return '0'
        if (stringNumber === 'Error') return 'Error'

        const negative = stringNumber.startsWith('-')
        const unsigned = negative ? stringNumber.slice(1) : stringNumber
        const [integerPart, decimalDigits] = unsigned.split('.')
        const integerDigits = parseFloat(integerPart)
        const integerDisplay = isNaN(integerDigits)
            ? ''
            : integerDigits.toLocaleString('en-US', { maximumFractionDigits: 0 })
        const sign = negative ? '-' : ''

        if (decimalDigits != null) {
            return `${sign}${integerDisplay}.${decimalDigits}`
        }
        return `${sign}${integerDisplay}`
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand)
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
        } else {
            this.previousOperandTextElement.innerText = ''
        }
    }
}

const numberButtons = document.querySelectorAll('[data-number]')
const operationButtons = document.querySelectorAll('[data-operation]')
const equalsButton = document.querySelector('[data-equals]')
const deleteButton = document.querySelector('[data-delete]')
const allClearButton = document.querySelector('[data-clear]')
const previousOperandTextElement = document.querySelector('[data-po]')
const currentOperandTextElement = document.querySelector('[data-co]')

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement)

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText)
        calculator.updateDisplay()
    })
})

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operation)
        calculator.updateDisplay()
    })
})

equalsButton.addEventListener('click', () => {
    calculator.compute()
    calculator.updateDisplay()
})

allClearButton.addEventListener('click', () => {
    calculator.clear()
    calculator.updateDisplay()
})

deleteButton.addEventListener('click', () => {
    calculator.delete()
    calculator.updateDisplay()
})

const operationKeys = {
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '÷',
    '÷': '÷'
}

document.addEventListener('keydown', event => {
    if (event.key >= '0' && event.key <= '9') {
        calculator.appendNumber(event.key)
    } else if (event.key === '.') {
        calculator.appendNumber('.')
    } else if (operationKeys[event.key]) {
        calculator.chooseOperation(operationKeys[event.key])
    } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault()
        calculator.compute()
    } else if (event.key === 'Backspace') {
        calculator.delete()
    } else if (event.key === 'Escape') {
        calculator.clear()
    } else {
        return
    }
    calculator.updateDisplay()
})
