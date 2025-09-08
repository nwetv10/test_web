let currentPage = 1;
const itemsPerPage = 40;

function detectDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile');
        itemsPerPage = 20;
    } else {
        document.body.classList.add('desktop');
    }
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
        
        item.addEventListener('mouseenter', function() {
            this.classList.add('hover-effect');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('hover-effect');
        });
        
        item.addEventListener('click', function() {
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
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Ошибка копирования:', err);
    }
    
    document.body.removeChild(textarea);
}

function showCopyNotification() {
    const notification = document.getElementById('copy-notification');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    detectDevice();
    displayQuestions(currentPage);
    
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
    
    if (document.body.classList.contains('mobile')) {
        document.addEventListener('touchstart', function() {}, { passive: true });
    }
});