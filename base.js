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

function updateAllPagination() {
    const pageInfo = document.getElementById('page-info');
    const floatingInfo = document.getElementById('floating-page-info');
    const bottomInfo = document.getElementById('bottom-page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const floatingPrev = document.getElementById('floating-prev');
    const floatingNext = document.getElementById('floating-next');
    const bottomPrev = document.getElementById('bottom-prev-page');
    const bottomNext = document.getElementById('bottom-next-page');
    
    let totalPages, currentText;
    
    if (currentFilterMode === 'identical') {
        totalPages = Math.ceil(groupedQuestions.length / maxGroupsPerPage);
        currentText = `Страница ${currentPage} из ${totalPages}`;
    } else {
        totalPages = Math.ceil(questionDatabase.length / itemsPerPage);
        currentText = `Страница ${currentPage} из ${totalPages}`;
    }
    
    pageInfo.textContent = currentText;
    floatingInfo.textContent = `${currentPage}/${totalPages}`;
    bottomInfo.textContent = currentText;
    
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
    
    prevButton.disabled = isFirstPage;
    nextButton.disabled = isLastPage;
    floatingPrev.disabled = isFirstPage;
    floatingNext.disabled = isLastPage;
    bottomPrev.disabled = isFirstPage;
    bottomNext.disabled = isLastPage;
}

function toggleFloatingPagination() {
    const floatingPagination = document.querySelector('.floating-pagination');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop > 200 && scrollTop + windowHeight < documentHeight - 100) {
        floatingPagination.classList.add('visible');
    } else {
        floatingPagination.classList.remove('visible');
    }
}

function displayQuestions(page) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
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
    }
    
    updateAllPagination();
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

function navigateToPage(direction) {
    const maxPage = currentFilterMode === 'identical' 
        ? Math.ceil(groupedQuestions.length / maxGroupsPerPage)
        : Math.ceil(questionDatabase.length / itemsPerPage);
    
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
        displayQuestions(currentPage);
    } else if (direction === 'next' && currentPage < maxPage) {
        currentPage++;
        displayQuestions(currentPage);
    }
}

function addButtonClickEffects() {
    const buttons = document.querySelectorAll('.pagination-button, .floating-pagination-button');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(0.95)';
            }
        });
        
        button.addEventListener('mouseup', function() {
            if (!this.disabled) {
                this.style.transform = '';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = '';
            }
        });
        
        button.addEventListener('touchstart', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(0.95)';
            }
        });
        
        button.addEventListener('touchend', function() {
            if (!this.disabled) {
                this.style.transform = '';
            }
        });
    });
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
    
    document.getElementById('prev-page').addEventListener('click', () => navigateToPage('prev'));
    document.getElementById('next-page').addEventListener('click', () => navigateToPage('next'));
    document.getElementById('floating-prev').addEventListener('click', () => navigateToPage('prev'));
    document.getElementById('floating-next').addEventListener('click', () => navigateToPage('next'));
    document.getElementById('bottom-prev-page').addEventListener('click', () => navigateToPage('prev'));
    document.getElementById('bottom-next-page').addEventListener('click', () => navigateToPage('next'));
    
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    window.addEventListener('scroll', toggleFloatingPagination);
    toggleFloatingPagination();
    
    addButtonClickEffects();
});
