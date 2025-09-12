let currentPage = 1;
const itemsPerPage = 20;
let questionDatabase = [];

function loadQuestions() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'questions.txt', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const text = xhr.responseText;
            parseQuestions(text);
            displayQuestions(currentPage);
        }
    };
    xhr.send();
}

function parseQuestions(text) {
    const questions = text.split('\n---------------\n\n');
    questionDatabase = [];
    
    questions.forEach(block => {
        if (block.trim()) {
            const lines = block.split('\n');
            if (lines.length >= 2) {
                const question = lines[0].trim();
                let answer = '';
                
                if (lines[1].startsWith('Ответ:')) {
                    if (lines[1] === 'Ответ:') {
                        answer = lines.slice(2).join('\n').trim();
                    } else {
                        answer = lines[1].substring(6).trim();
                        if (lines.length > 2) {
                            answer += '\n' + lines.slice(2).join('\n').trim();
                        }
                    }
                }
                
                if (question && answer) {
                    questionDatabase.push({
                        question: question,
                        answer: answer
                    });
                }
            }
        }
    });
}

function displayQuestions(page) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, questionDatabase.length);
    
    for (let i = startIndex; i < endIndex; i++) {
        const item = questionDatabase[i];
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.setAttribute('data-answer', item.answer);
        
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.textContent = item.question;
        
        const answerText = document.createElement('div');
        answerText.className = 'answer-text';
        answerText.innerHTML = item.answer.replace(/\n/g, '<br>');
        
        questionItem.appendChild(questionText);
        questionItem.appendChild(answerText);
        
        resultsContainer.appendChild(questionItem);
    }
    
    document.getElementById('page-info').textContent = `Страница ${page} из ${Math.ceil(questionDatabase.length / itemsPerPage)}`;
    
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = page === Math.ceil(questionDatabase.length / itemsPerPage);
    
    addCopyHandlers();
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function addCopyHandlers() {
    const questionItems = document.querySelectorAll('.question-item');
    questionItems.forEach(item => {
        item.addEventListener('touchstart', function() {
            this.classList.add('hover-effect');
        });
        
        item.addEventListener('touchend', function() {
            this.classList.remove('hover-effect');
        });
        
        item.addEventListener('click', function(e) {
            if (e.target.tagName === 'MARK') return;
            
            const answer = this.getAttribute('data-answer');
            copyToClipboard(answer);
            showCopyNotification();
            
            this.classList.add('click-effect');
            
            setTimeout(() => {
                this.classList.remove('click-effect');
            }, 600);
        });
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

function showCopyNotification() {
    const notification = document.getElementById('copy-notification');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayQuestions(currentPage);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < Math.ceil(questionDatabase.length / itemsPerPage)) {
            currentPage++;
            displayQuestions(currentPage);
        }
    });
    
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
});
