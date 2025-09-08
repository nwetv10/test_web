function searchQuestions(keywords) {
    const results = [];
    const nonEmptyKeywords = keywords.filter(keyword => keyword.trim().length > 0);
    
    if (nonEmptyKeywords.length === 0) {
        return results;
    }
    questionDatabase.forEach(item => {
        const question = item.question.toLowerCase();
        let matchesAll = true;
        for (const keyword of nonEmptyKeywords) {
            if (!question.includes(keyword.toLowerCase())) {
                matchesAll = false;
                break;
            }
        }
        
        if (matchesAll) {
            results.push(item);
        }
    });
    
    return results;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightText(text, keywords) {
    if (!keywords || keywords.length === 0) return escapeHtml(text);
    
    let highlightedText = escapeHtml(text);
    const nonEmptyKeywords = keywords.filter(keyword => keyword.trim().length > 0);
    
    nonEmptyKeywords.forEach(keyword => {
        if (keyword.trim() !== '') {
            const regex = new RegExp(escapeRegex(keyword), 'gi');
            highlightedText = highlightedText.replace(regex, match => `<mark>${match}</mark>`);
        }
    });
    
    return highlightedText;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function displayResults(results, keywords) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = '<h3>Ничего не найдено</h3><p>Скорее всего этого вопроса нет в базе, либо ошибка в фрагментах</p>';
        resultsContainer.appendChild(noResults);
        showSearchNotification('Вопрос не найден!', true);
        return;
    }
    
    results.forEach(item => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.setAttribute('data-answer', item.answer);
        
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.innerHTML = highlightText(item.question, keywords);
        
        const answerText = document.createElement('div');
        answerText.className = 'answer-text';
        answerText.innerHTML = highlightText(item.answer, keywords).replace(/\n/g, '<br>');
        
        questionItem.appendChild(questionText);
        questionItem.appendChild(answerText);
        
        resultsContainer.appendChild(questionItem);
    });
    showSearchNotification(`Найдено вопросов: ${results.length}`, false);
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

function showSearchNotification(message, isError) {
    const notification = document.getElementById('search-notification');
    notification.textContent = message;
    notification.classList.remove('error');
    
    if (isError) {
        notification.classList.add('error');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('questions-count').textContent = questionDatabase.length;
    
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', handleSearch);
    
    document.getElementById('database-button').addEventListener('click', () => {
        window.location.href = 'base.html';
    });
    
    const inputFields = ['keyword1', 'keyword2', 'keyword3', 'keyword4'];
    inputFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                const nextInput = inputFields[inputFields.indexOf(fieldId) + 1];
                if (nextInput) {
                    document.getElementById(nextInput).focus();
                }
            }
        });
    });
    
    function handleSearch() {
        const keyword1 = document.getElementById('keyword1').value.trim();
        const keyword2 = document.getElementById('keyword2').value.trim();
        const keyword3 = document.getElementById('keyword3').value.trim();
        const keyword4 = document.getElementById('keyword4').value.trim();
        
        const keywords = [keyword1, keyword2, keyword3, keyword4];
        const results = searchQuestions(keywords);
        displayResults(results, keywords);
        
        document.getElementById('keyword1').value = '';
        document.getElementById('keyword2').value = '';
        document.getElementById('keyword3').value = '';
        document.getElementById('keyword4').value = '';
        document.getElementById('keyword1').focus();
        
        window.scrollTo({
            top: document.getElementById('results').offsetTop - 20,
            behavior: 'smooth'
        });
    }
    
    document.getElementById('keyword1').focus();
    
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
});
