let currentPage = 1;
const itemsPerPage = 25;
const maxGroupsPerPage = 6;
let currentFilterMode = 'all';
let groupedQuestions = [];

function groupIdenticalQuestions() {
    const groups = {};
    
    questionDatabase.forEach(item => {
        const question = item.question.trim();
        if (!groups[question]) {
            groups[question] = [];
        }
        groups[question].push(item);
    });
    
    return Object.values(groups)
        .sort((a, b) => b.length - a.length)
        .filter(group => group.length > 1);
}

function displayQuestions(page) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    let itemsToDisplay = [];
    
    if (currentFilterMode === 'identical') {
        const startIndex = (page - 1) * maxGroupsPerPage;
        const endIndex = Math.min(startIndex + maxGroupsPerPage, groupedQuestions.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const group = groupedQuestions[i];
            const groupContainer = document.createElement('div');
            groupContainer.className = 'question-group';
            
            const groupHeader = document.createElement('div');
            groupHeader.className = 'group-header';
            groupHeader.textContent = `Вопрос (${group.length} варианта ответа):`;
            groupContainer.appendChild(groupHeader);
            
            const questionText = document.createElement('div');
            questionText.className = 'group-question-text';
            questionText.textContent = group[0].question;
            groupContainer.appendChild(questionText);
            
            group.forEach((item, index) => {
                const questionItem = document.createElement('div');
                questionItem.className = 'question-item group-item';
                questionItem.setAttribute('data-answer', item.answer);
                
                const answerHeader = document.createElement('div');
                answerHeader.className = 'answer-header';
                answerHeader.textContent = `Ответ ${index + 1}:`;
                questionItem.appendChild(answerHeader);
                
                const answerText = document.createElement('div');
                answerText.className = 'answer-text';
                answerText.innerHTML = item.answer.replace(/\n/g, '<br>');
                questionItem.appendChild(answerText);
                
                groupContainer.appendChild(questionItem);
            });
            
            resultsContainer.appendChild(groupContainer);
        }
        
        document.getElementById('page-info').textContent = `Страница ${page} из ${Math.ceil(groupedQuestions.length / maxGroupsPerPage)}`;
        document.getElementById('prev-page').disabled = page === 1;
        document.getElementById('next-page').disabled = page === Math.ceil(groupedQuestions.length / maxGroupsPerPage);
        
    } else {
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
    }
    
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

function toggleFilterMode() {
    if (currentFilterMode === 'all') {
        currentFilterMode = 'identical';
        groupedQuestions = groupIdenticalQuestions();
        currentPage = 1;
        document.getElementById('filter-button').textContent = 'Показать все вопросы';
        document.getElementById('filter-button').classList.add('active-filter');
    } else {
        currentFilterMode = 'all';
        currentPage = 1;
        document.getElementById('filter-button').textContent = 'Фильтр по одинаковым вопросам';
        document.getElementById('filter-button').classList.remove('active-filter');
    }
    displayQuestions(currentPage);
}

document.addEventListener('DOMContentLoaded', function() {
    const paginationControls = document.querySelector('.pagination-controls');
    const filterButton = document.createElement('button');
    filterButton.id = 'filter-button';
    filterButton.className = 'filter-button';
    filterButton.textContent = 'Фильтр по одинаковым вопросам';
    paginationControls.parentNode.insertBefore(filterButton, paginationControls.nextSibling);
    
    filterButton.addEventListener('click', toggleFilterMode);
    
    displayQuestions(currentPage);
    
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayQuestions(currentPage);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        const maxPage = currentFilterMode === 'identical' 
            ? Math.ceil(groupedQuestions.length / maxGroupsPerPage)
            : Math.ceil(questionDatabase.length / itemsPerPage);
            
        if (currentPage < maxPage) {
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
