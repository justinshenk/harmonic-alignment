// Load traditions data
let traditionsData = null;

// Sort state
let sortState = {
    column: 'yearOrigin',
    direction: 'desc' // Reverse chronological (newest first)
};

// Table display state
let tableDisplayState = {
    showAll: true,  // Show all rows by default
    initialRowCount: 10
};

// Quiz state
let quizState = {
    currentQuestion: 0,
    answers: {},
    questions: [
        {
            id: 'goals',
            question: 'What are your primary goals?',
            type: 'multiple',
            options: [
                { value: 'mental-health', label: 'Address mental health challenges (ADHD, depression, anxiety, trauma)', weights: { adhd: 1, depression: 1, anxiety: 1, trauma: 1 } },
                { value: 'cognitive', label: 'Improve focus, insight, and metacognition', weights: { focus: 1, metacognition: 1, insight: 1 } },
                { value: 'relational', label: 'Enhance compassion, communication, and empathy', weights: { compassion: 1, communication: 1, empathy: 1 } },
                { value: 'somatic', label: 'Develop body awareness and emotional regulation', weights: { bodyAwareness: 1, emotionalRegulation: 1 } }
            ]
        },
        {
            id: 'tradition',
            question: 'What\'s your relationship to spiritual/religious traditions?',
            type: 'single',
            options: [
                { value: 'secular', label: 'Prefer secular, evidence-based practices' },
                { value: 'open', label: 'Open to practices from any tradition' },
                { value: 'spiritual', label: 'Open to spiritual but not religious practices' },
                { value: 'religious', label: 'I have a religious background' }
            ]
        },
        {
            id: 'religiousBackground',
            question: 'Which tradition(s)?',
            type: 'multiple',
            showIf: (answers) => answers.tradition === 'religious',
            options: [
                { value: 'buddhism', label: 'Buddhism' },
                { value: 'christianity', label: 'Christianity' },
                { value: 'judaism', label: 'Judaism' },
                { value: 'islam', label: 'Islam' },
                { value: 'hinduism', label: 'Hinduism' },
                { value: 'other', label: 'Other' }
            ]
        },
        {
            id: 'traditionPreference',
            question: 'Do you prefer practices from your tradition(s)?',
            type: 'single',
            showIf: (answers) => answers.tradition === 'religious',
            options: [
                { value: 'prefer', label: 'Yes, prioritize practices from my tradition(s)' },
                { value: 'open', label: 'No, I\'m open to all traditions' }
            ]
        },
        {
            id: 'timeCommitment',
            question: 'How much time can you commit?',
            type: 'single',
            options: [
                { value: 'minimal', label: '15-30 minutes daily', filter: (t) => t.timeCommitment.includes('15') || t.timeCommitment.includes('20') },
                { value: 'moderate', label: '30-60 minutes daily', filter: (t) => t.timeCommitment.includes('30') || t.timeCommitment.includes('40') || t.timeCommitment.includes('45') },
                { value: 'significant', label: '1+ hours daily or weekly sessions', filter: (t) => t.timeCommitment.includes('hour') || t.timeCommitment.includes('Weekly') || t.timeCommitment.includes('session') },
                { value: 'any', label: 'Flexible / any amount', filter: (t) => true }
            ]
        },
        {
            id: 'guidance',
            question: 'Do you prefer guided or independent practice?',
            type: 'single',
            options: [
                { value: 'independent', label: 'Independent practice with minimal guidance', filter: (t) => t.guidanceNeeded === 'Low' || t.guidanceNeeded === 'Low-Medium' },
                { value: 'some-guidance', label: 'Some guidance or periodic check-ins', filter: (t) => t.guidanceNeeded === 'Medium' || t.guidanceNeeded === 'Medium-High' },
                { value: 'professional', label: 'Professional therapist or teacher required', filter: (t) => t.guidanceNeeded === 'High' || t.guidanceNeeded === 'Very High' },
                { value: 'any', label: 'Open to any level', filter: (t) => true }
            ]
        },
        {
            id: 'accessibility',
            question: 'What level of accessibility do you need?',
            type: 'single',
            options: [
                { value: 'very-high', label: 'Widely available and easy to start', filter: (t) => t.accessibility === 'Very High' || t.accessibility === 'High' },
                { value: 'medium', label: 'Some barriers okay (cost, availability)', filter: (t) => t.accessibility === 'Medium' || t.accessibility === 'High' || t.accessibility === 'Very High' },
                { value: 'any', label: 'Willing to seek out specialized resources', filter: (t) => true }
            ]
        },
        {
            id: 'specificNeeds',
            question: 'Any specific areas you want to focus on? (optional)',
            type: 'multiple',
            optional: true,
            options: [
                { value: 'adhd', label: 'ADHD', weights: { adhd: 2 } },
                { value: 'depression', label: 'Depression', weights: { depression: 2 } },
                { value: 'anxiety', label: 'Anxiety', weights: { anxiety: 2 } },
                { value: 'trauma', label: 'Trauma', weights: { trauma: 2 } },
                { value: 'focus', label: 'Focus & Concentration', weights: { focus: 2 } },
                { value: 'insight', label: 'Self-understanding & Insight', weights: { insight: 2, metacognition: 1 } },
                { value: 'compassion', label: 'Compassion & Empathy', weights: { compassion: 2, empathy: 2 } }
            ]
        }
    ]
};


// API endpoint for practice chat (use local dev or production)
const PRACTICE_CHAT_API = window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api/practice-chat'
    : 'https://www.justinshenk.com/api/practice-chat';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeNavigation();
    initializeHamburgerMenu();
    initializeQuiz();
    initializePracticeChat();
    renderComparisonTable();
    renderEvolutionTree();
    initializeResearchSection();
});

// Hamburger menu toggle
function initializeHamburgerMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const nav = document.getElementById('mainNav');

    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('open');
    });

    // Close menu when a nav button is clicked
    nav.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            hamburger.classList.remove('active');
            nav.classList.remove('open');
        });
    });
}

// Tab switching for finder
function switchFinderTab(tab) {
    document.getElementById('tabQuiz').classList.toggle('active', tab === 'quiz');
    document.getElementById('tabChat').classList.toggle('active', tab === 'chat');
    document.getElementById('finderQuiz').classList.toggle('active', tab === 'quiz');
    document.getElementById('finderChat').classList.toggle('active', tab === 'chat');
    document.getElementById('finderQuiz').style.display = tab === 'quiz' ? 'block' : 'none';
    document.getElementById('finderChat').style.display = tab === 'chat' ? 'block' : 'none';
}

// Switch between explore sub-tabs (Evolution, Complexity, Attention)
function switchExploreTab(tab) {
    // Update tab buttons
    document.getElementById('tabEvolution').classList.toggle('active', tab === 'evolution');
    document.getElementById('tabComplexity').classList.toggle('active', tab === 'complexity');
    document.getElementById('tabAttention').classList.toggle('active', tab === 'attention');

    // Update content visibility
    document.getElementById('exploreEvolution').classList.toggle('active', tab === 'evolution');
    document.getElementById('exploreComplexity').classList.toggle('active', tab === 'complexity');
    document.getElementById('exploreAttention').classList.toggle('active', tab === 'attention');

    // Initialize visualizations for the selected tab
    if (tab === 'complexity') {
        initializeComplexityView();
    } else if (tab === 'attention') {
        renderAttentionClassification();
    } else if (tab === 'evolution') {
        if (typeof renderEvolutionTree === 'function') {
            renderEvolutionTree();
        }
    }
}

// Initialize finder with chat as default
function initializeFinder() {
    switchFinderTab('chat');
}

// Render chat recommendations with links to traditions
function renderChatRecommendations(data) {
    if (!data.recommendations || !data.recommendations.length) {
        return '<p>No recommendations found. Try describing your situation differently.</p>';
    }

    let html = '<div class="chat-recommendations">';
    data.recommendations.forEach(rec => {
        // Escape all user-controlled data to prevent XSS
        const escapeHtml = (str) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const escaped = {
            practice: escapeHtml(rec.practice),
            traditionName: escapeHtml(rec.traditionName),
            why: escapeHtml(rec.why),
            tryNow: escapeHtml(rec.tryNow),
            traditionId: escapeHtml(rec.traditionId)
        };
        const traditionLink = escaped.traditionId
            ? `<a href="#" onclick="viewTraditionInCompare('${escaped.traditionId}'); return false;" class="tradition-link">${escaped.traditionName}</a>`
            : escaped.traditionName;

        html += `<div class="recommendation-item">
            <div class="rec-header">
                <strong>${escaped.practice}</strong>
                <span class="rec-tradition">${traditionLink}</span>
            </div>
            <p class="rec-why">${escaped.why}</p>
            <div class="rec-try">
                <span class="try-label">Try now:</span> ${escaped.tryNow}
            </div>
            <div class="rec-actions">
                <a href="#" onclick="viewTraditionInCompare('${escaped.traditionId}'); return false;" class="action-link">Learn more about this tradition</a>
            </div>
        </div>`;
    });
    html += '</div>';

    // Add invitation to explore deeper
    html += `<div class="deeper-exploration">
        <p class="explore-note">These suggestions are starting points. Many practices reveal their depth over weeks and months of consistent engagement.</p>
        <div class="explore-actions">
            <button onclick="document.getElementById('startQuiz').click();" class="secondary-button small">Take the full quiz</button>
            <button onclick="document.getElementById('compareView').click();" class="secondary-button small">Browse all traditions</button>
        </div>
    </div>`;

    if (data.note) {
        const escapedNote = data.note.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += `<p class="chat-note">${escapedNote}</p>`;
    }

    return html;
}

// Navigate to tradition in compare table
function viewTraditionInCompare(traditionId) {
    document.getElementById('compareView').click();
    setTimeout(() => {
        const row = document.querySelector(`tr[data-tradition-id="${traditionId}"]`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.style.background = '#fff3cd';
            setTimeout(() => row.style.background = '', 2000);
        }
    }, 100);
}

// Practice chat functionality
function initializePracticeChat() {
    const form = document.getElementById('practiceChat');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const input = document.getElementById('chatInput');
        const submitBtn = document.getElementById('chatSubmit');
        const responseDiv = document.getElementById('chatResponse');
        const message = input.value.trim();

        if (!message) return;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = '...';
        responseDiv.style.display = 'block';
        responseDiv.innerHTML = '<span style="color: #888;">Finding practices for you...</span>';

        try {
            // Build tradition list from loaded data
            const traditions = traditionsData?.traditions?.map(t => ({
                id: t.id,
                name: t.name,
                practices: t.practices
            })) || [];

            const response = await fetch(PRACTICE_CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, traditions })
            });

            const data = await response.json();

            if (data.error) {
                responseDiv.textContent = 'Sorry, something went wrong. Please try the quiz instead.';
            } else {
                // Try to parse as JSON, fallback to text
                try {
                    const parsed = JSON.parse(data.response);
                    responseDiv.innerHTML = renderChatRecommendations(parsed);
                } catch {
                    // Fallback: render as text with basic formatting
                    const escaped = data.response
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    responseDiv.innerHTML = escaped
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n\n/g, '<br><br>')
                        .replace(/\n/g, '<br>');
                }
            }
        } catch (error) {
            console.error('Practice chat error:', error);
            responseDiv.textContent = 'Could not connect to the recommendation service. Please try the quiz instead.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Ask';
        }
    });
}

async function loadData() {
    try {
        const response = await fetch('data/traditions.json');
        const data = await response.json();
        // Ensure traditionsData has .traditions property
        if (data.traditions) {
            traditionsData = data;
        } else {
            traditionsData = { traditions: data };
        }
        console.log('✓ Loaded traditions data');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function loadFromCSV() {
    const response = await fetch('data/traditions-template.csv');

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    return parseCSVToTraditions(csvText);
}

function parseCSVToTraditions(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const traditions = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        if (values.length < headers.length) continue;

        const row = {};
        headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
        });

        if (!row.id || !row.name) continue;

        // Parse pipe-separated fields
        const practices = row.practices ? row.practices.split('|').map(p => p.trim()).filter(p => p) : [];
        const parentTraditions = row.parentTraditions ? row.parentTraditions.split('|').map(p => p.trim()).filter(p => p) : [];
        const citations = row.citations ? row.citations.split('|').map(c => c.trim()).filter(c => c) : [];

        // Build effectiveness scores
        const effectiveness = {};
        ['adhd', 'depression', 'anxiety', 'trauma', 'focus', 'metacognition',
         'insight', 'compassion', 'communication', 'empathy',
         'bodyAwareness', 'emotionalRegulation'].forEach(metric => {
            const value = parseInt(row[metric]) || 0;
            effectiveness[metric] = Math.max(0, Math.min(5, value));
        });

        traditions.push({
            id: row.id,
            name: row.name,
            origin: row.origin,
            yearOrigin: parseInt(row.yearOrigin) || 0,
            parentTraditions: parentTraditions,
            description: row.description,
            practices: practices,
            timeCommitment: row.timeCommitment,
            guidanceNeeded: row.guidanceNeeded,
            accessibility: row.accessibility,
            effectiveness: effectiveness,
            researchSupport: row.researchSupport,
            citations: citations
        });
    }

    return {
        traditions: traditions,
        dimensions: {
            mentalHealth: ['adhd', 'depression', 'anxiety', 'trauma'],
            cognitive: ['focus', 'metacognition', 'insight'],
            relational: ['compassion', 'communication', 'empathy'],
            somatic: ['bodyAwareness', 'emotionalRegulation']
        },
        scale: {
            '1': 'Minimal/No evidence',
            '2': 'Low effectiveness',
            '3': 'Moderate effectiveness',
            '4': 'High effectiveness',
            '5': 'Very high effectiveness'
        }
    };
}

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
}

async function loadFromGoogleSheets() {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv&gid=0`;
    const response = await fetch(csvUrl);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    return parseCSVToTraditions(csvText);
}

function parseCSVToTraditions(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const traditions = [];

    // Validate headers
    const requiredHeaders = ['id', 'name', 'origin', 'description'];
    const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
    if (!hasRequiredHeaders) {
        throw new Error('Invalid sheet format: missing required columns');
    }

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        if (values.length < headers.length) continue;

        const row = {};
        headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
        });

        // Skip rows without required fields
        if (!row.id || !row.name) continue;

        // Parse practices (comma-separated, but within quotes if needed)
        const practices = row.practices ? row.practices.split('|').map(p => p.trim()).filter(p => p) : [];

        // Parse parent traditions
        const parentTraditions = row.parentTraditions ? row.parentTraditions.split('|').map(p => p.trim()).filter(p => p) : [];

        // Parse citations
        const citations = row.citations ? row.citations.split('|').map(c => c.trim()).filter(c => c) : [];

        // Build effectiveness scores (validate 1-5 range)
        const effectiveness = {};
        ['adhd', 'depression', 'anxiety', 'trauma', 'focus', 'metacognition',
         'insight', 'compassion', 'communication', 'empathy',
         'bodyAwareness', 'emotionalRegulation'].forEach(metric => {
            const value = parseInt(row[metric]) || 0;
            // Clamp to valid range
            effectiveness[metric] = Math.max(0, Math.min(5, value));
        });

        traditions.push({
            id: row.id,
            name: row.name,
            origin: row.origin,
            yearOrigin: parseInt(row.yearOrigin) || 0,
            parentTraditions: parentTraditions,
            description: row.description,
            practices: practices,
            timeCommitment: row.timeCommitment,
            guidanceNeeded: row.guidanceNeeded,
            accessibility: row.accessibility,
            effectiveness: effectiveness,
            researchSupport: row.researchSupport,
            citations: citations
        });
    }

    return {
        traditions: traditions,
        dimensions: {
            mentalHealth: ['adhd', 'depression', 'anxiety', 'trauma'],
            cognitive: ['focus', 'metacognition', 'insight'],
            relational: ['compassion', 'communication', 'empathy'],
            somatic: ['bodyAwareness', 'emotionalRegulation']
        },
        scale: {
            '1': 'Minimal/No evidence',
            '2': 'Low effectiveness',
            '3': 'Moderate effectiveness',
            '4': 'High effectiveness',
            '5': 'Very high effectiveness'
        }
    };
}

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
}

function initializeNavigation() {
    const buttons = {
        quizView: 'quiz-section',
        compareView: 'compare-section',
        exploreView: 'explore-section',
        ratingsView: 'ratings-section',
        profileView: 'profile-section',
        aboutView: 'about-section'
    };

    // Map clean URLs to view IDs
    const pathToView = {
        '/': 'quizView',
        '/quiz': 'quizView',
        '/compare': 'compareView',
        '/explore': 'exploreView',
        '/ratings': 'ratingsView',
        '/profile': 'profileView',
        '/about': 'aboutView'
    };

    const viewToPath = {
        'quizView': '/quiz',
        'compareView': '/compare',
        'exploreView': '/explore',
        'ratingsView': '/ratings',
        'profileView': '/profile',
        'aboutView': '/about'
    };

    // Function to switch to a section
    function switchToSection(buttonId, pushState = true) {
        if (!buttons[buttonId]) return;

        // Update active button
        document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(buttonId).classList.add('active');

        // Update active section
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById(buttons[buttonId]).classList.add('active');

        // Save to localStorage
        localStorage.setItem('activeSection', buttonId);

        // Push to browser history with clean URL (unless we're responding to popstate)
        if (pushState) {
            const path = viewToPath[buttonId] || `#${buttonId}`;
            history.pushState({ section: buttonId }, '', path);
        }

        // Initialize explore section visualizations
        if (buttonId === 'exploreView') {
            initializeComplexityView();
            renderAttentionClassification();
            if (typeof renderEvolutionTree === 'function') {
                renderEvolutionTree();
            }
        }

        // Load user practices when switching to profile view
        if (buttonId === 'profileView') {
            if (typeof loadUserPractices === 'function') {
                loadUserPractices();
            }
        }
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.section) {
            switchToSection(event.state.section, false);
        } else {
            // Check pathname for clean URLs
            const viewFromPath = pathToView[window.location.pathname];
            if (viewFromPath) {
                switchToSection(viewFromPath, false);
            } else {
                switchToSection('quizView', false);
            }
        }
    });

    // Check URL on load (clean path or hash)
    const pathname = window.location.pathname;
    const hash = window.location.hash.slice(1);

    // First check clean URL path
    if (pathToView[pathname]) {
        const viewId = pathToView[pathname];
        switchToSection(viewId, false);
        history.replaceState({ section: viewId }, '', pathname);
    } else if (hash && buttons[hash]) {
        // Fall back to hash-based routing for backwards compatibility
        switchToSection(hash, false);
        history.replaceState({ section: hash }, '', viewToPath[hash] || `#${hash}`);
    } else {
        // Restore saved section from localStorage
        const savedSection = localStorage.getItem('activeSection');
        if (savedSection && buttons[savedSection]) {
            switchToSection(savedSection, false);
            history.replaceState({ section: savedSection }, '', viewToPath[savedSection] || `#${savedSection}`);
        } else {
            history.replaceState({ section: 'quizView' }, '', '/quiz');
        }
    }

    Object.keys(buttons).forEach(buttonId => {
        document.getElementById(buttonId).addEventListener('click', () => {
            switchToSection(buttonId, true);
        });
    });

    // Add filter listeners
    document.getElementById('dimensionFilter').addEventListener('change', renderComparisonTable);
}

function initializeQuiz() {
    document.getElementById('startQuiz').addEventListener('click', startQuiz);
    document.getElementById('prevQuestion').addEventListener('click', prevQuestion);
    document.getElementById('nextQuestion').addEventListener('click', nextQuestion);
    document.getElementById('restartQuiz').addEventListener('click', restartQuiz);
    document.getElementById('compareRecommendations').addEventListener('click', () => {
        // Switch to compare view
        document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
        document.getElementById('compareView').classList.add('active');
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById('compare-section').classList.add('active');

        // Save to localStorage
        localStorage.setItem('activeSection', 'compareView');

        // Scroll to top
        window.scrollTo(0, 0);
    });
}

function startQuiz() {
    quizState.currentQuestion = 0;
    quizState.answers = {};

    document.getElementById('quiz-intro').classList.remove('active');
    document.getElementById('quiz-questions').classList.add('active');

    renderQuestion();
}

// Check if a question should be shown based on showIf condition
function shouldShowQuestion(question) {
    if (!question.showIf) return true;
    return question.showIf(quizState.answers);
}

// Get list of currently visible questions based on answers
function getVisibleQuestions() {
    return quizState.questions.filter(q => shouldShowQuestion(q));
}

// Find next visible question index
function findNextVisibleQuestion(fromIndex) {
    for (let i = fromIndex + 1; i < quizState.questions.length; i++) {
        if (shouldShowQuestion(quizState.questions[i])) {
            return i;
        }
    }
    return -1; // No more questions
}

// Find previous visible question index
function findPrevVisibleQuestion(fromIndex) {
    for (let i = fromIndex - 1; i >= 0; i--) {
        if (shouldShowQuestion(quizState.questions[i])) {
            return i;
        }
    }
    return -1; // No previous questions
}

function restartQuiz() {
    document.getElementById('quiz-results').classList.remove('active');
    document.getElementById('quiz-intro').classList.add('active');
}

function renderQuestion() {
    const question = quizState.questions[quizState.currentQuestion];
    const visibleQuestions = getVisibleQuestions();
    const currentVisibleIndex = visibleQuestions.findIndex(q => q.id === question.id);
    const totalVisible = visibleQuestions.length;

    document.getElementById('questionNumber').textContent = `Question ${currentVisibleIndex + 1} of ${totalVisible}`;

    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((currentVisibleIndex + 1) / totalVisible) * 100;
        progressBar.style.width = `${progress}%`;
    }

    let html = `<h3>${question.question}</h3>`;

    if (question.type === 'multiple') {
        html += '<p class="question-hint">Select all that apply</p>';
        html += '<div class="options">';
        question.options.forEach(option => {
            const checked = quizState.answers[question.id]?.includes(option.value) ? 'checked' : '';
            html += `
                <label class="option-checkbox">
                    <input type="checkbox" name="${question.id}" value="${option.value}" ${checked}>
                    <span>${option.label}</span>
                </label>
            `;
        });
        html += '</div>';
    } else {
        html += '<div class="options">';
        question.options.forEach(option => {
            const checked = quizState.answers[question.id] === option.value ? 'checked' : '';
            html += `
                <label class="option-radio">
                    <input type="radio" name="${question.id}" value="${option.value}" ${checked}>
                    <span>${option.label}</span>
                </label>
            `;
        });
        html += '</div>';
    }

    document.getElementById('questionContainer').innerHTML = html;

    // Update navigation buttons
    const hasPrev = findPrevVisibleQuestion(quizState.currentQuestion) >= 0;
    const isLastVisible = currentVisibleIndex === totalVisible - 1;
    document.getElementById('prevQuestion').style.display = hasPrev ? 'inline-block' : 'none';
    document.getElementById('nextQuestion').textContent = isLastVisible ? 'See Results' : 'Next';

    // Add change listeners to save answers
    const inputs = document.querySelectorAll(`input[name="${question.id}"]`);
    inputs.forEach(input => {
        input.addEventListener('change', () => saveAnswer(question));
    });
}

function saveAnswer(question) {
    const inputs = document.querySelectorAll(`input[name="${question.id}"]`);

    if (question.type === 'multiple') {
        const selected = Array.from(inputs)
            .filter(input => input.checked)
            .map(input => input.value);
        quizState.answers[question.id] = selected;
    } else {
        const selected = Array.from(inputs).find(input => input.checked);
        if (selected) {
            quizState.answers[question.id] = selected.value;
        }
    }
}

function prevQuestion() {
    const prevIndex = findPrevVisibleQuestion(quizState.currentQuestion);
    if (prevIndex >= 0) {
        quizState.currentQuestion = prevIndex;
        renderQuestion();
    }
}

function nextQuestion() {
    const question = quizState.questions[quizState.currentQuestion];

    // Validate answer (skip validation for optional questions)
    if (!question.optional && !quizState.answers[question.id]) {
        alert('Please select an answer before continuing');
        return;
    }

    if (question.type === 'multiple' && !question.optional && quizState.answers[question.id].length === 0) {
        alert('Please select at least one option');
        return;
    }

    const nextIndex = findNextVisibleQuestion(quizState.currentQuestion);
    if (nextIndex >= 0) {
        quizState.currentQuestion = nextIndex;
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-questions').classList.remove('active');
    document.getElementById('quiz-results').classList.add('active');

    const recommendations = calculateRecommendations();
    renderResults(recommendations);
}

// Categorize tradition origins
const originCategories = {
    secular: [
        'Western Phenomenology', 'Developmental Psychology', 'Humanistic Psychology',
        'Trauma Therapy', 'Clinical Mindfulness', 'Clinical Psychology', 'Psychotherapy',
        'Psychedelic Medicine', 'Somatic Therapy', 'Modern Breathwork', 'Conflict Resolution',
        'Relational Practice', 'Transpersonal Psychology', 'Secular Ethics', 'Ancient Greek Philosophy'
    ],
    spiritual: [
        'Buddhist', 'Buddhist (Theravada)', 'Tibetan Buddhism', 'Tibetan Buddhism / Dzogchen',
        'Japanese Buddhism', 'Vedic Tradition', 'Indian', 'Chinese', 'Chinese Martial Arts'
    ],
    religious: [
        'Jewish', 'Christian Mysticism', 'Islamic Mysticism', 'Hindu Philosophy', 'Amazonian Shamanism'
    ]
};

// Map user's religious background to tradition origins
const religiousBackgroundToOrigins = {
    buddhism: ['Buddhist', 'Buddhist (Theravada)', 'Tibetan Buddhism', 'Tibetan Buddhism / Dzogchen', 'Japanese Buddhism'],
    christianity: ['Christian Mysticism'],
    judaism: ['Jewish'],
    islam: ['Islamic Mysticism'],
    hinduism: ['Hindu Philosophy', 'Vedic Tradition', 'Indian']
};

function getOriginCategory(origin) {
    if (originCategories.secular.includes(origin)) return 'secular';
    if (originCategories.spiritual.includes(origin)) return 'spiritual';
    if (originCategories.religious.includes(origin)) return 'religious';
    return 'unknown';
}

function calculateRecommendations() {
    if (!traditionsData) return [];

    // Build weights from answers
    const weights = {};
    const filters = [];

    quizState.questions.forEach(question => {
        const answer = quizState.answers[question.id];
        if (!answer) return;

        if (question.type === 'multiple') {
            // Multiple selection - aggregate weights
            answer.forEach(value => {
                const option = question.options.find(o => o.value === value);
                if (option && option.weights) {
                    Object.entries(option.weights).forEach(([metric, weight]) => {
                        weights[metric] = (weights[metric] || 0) + weight;
                    });
                }
            });
        } else {
            // Single selection
            const option = question.options.find(o => o.value === answer);
            if (option) {
                if (option.weights) {
                    Object.entries(option.weights).forEach(([metric, weight]) => {
                        weights[metric] = (weights[metric] || 0) + weight;
                    });
                }
                if (option.filter) {
                    filters.push(option.filter);
                }
            }
        }
    });

    // Get tradition preferences
    const traditionPref = quizState.answers.tradition || 'open';
    const religiousBackgrounds = quizState.answers.religiousBackground || [];
    const preferOwnTradition = quizState.answers.traditionPreference === 'prefer';

    // Score each tradition
    const scored = traditionsData.traditions.map(tradition => {
        // Apply filters
        const passesFilters = filters.every(filter => filter(tradition));
        if (!passesFilters) return null;

        // Calculate weighted score
        let score = 0;
        Object.entries(weights).forEach(([metric, weight]) => {
            const effectiveness = tradition.effectiveness[metric] || 0;
            score += effectiveness * weight;
        });

        // Apply tradition preference adjustments
        const category = getOriginCategory(tradition.origin);

        if (traditionPref === 'secular') {
            // Deprioritize religious and spiritual traditions
            if (category === 'religious') {
                score *= 0.3; // Significant penalty
            } else if (category === 'spiritual') {
                score *= 0.6; // Moderate penalty
            }
        } else if (traditionPref === 'spiritual') {
            // Deprioritize strictly religious traditions
            if (category === 'religious') {
                score *= 0.5;
            }
        } else if (traditionPref === 'religious' && preferOwnTradition) {
            // Boost matching traditions
            const matchingOrigins = religiousBackgrounds.flatMap(bg => religiousBackgroundToOrigins[bg] || []);
            if (matchingOrigins.includes(tradition.origin)) {
                score *= 1.5; // Boost matching tradition
            }
        }

        // Calculate match reasons
        const matchedAreas = Object.entries(weights)
            .map(([metric, weight]) => {
                const effectiveness = tradition.effectiveness[metric] || 0;
                if (effectiveness >= 4 && weight > 0) { // High effectiveness in weighted area
                    return metric;
                }
                return null;
            })
            .filter(m => m !== null);

        return {
            tradition,
            score,
            matchedAreas
        };
    }).filter(item => item !== null);

    // Sort by score and return top 5
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5);
}

// Wikipedia URL mapping for traditions with different article names
const wikipediaMapping = {
    'Vipassana': 'Vipassanā',
    'Metta (Loving-Kindness)': 'Mettā',
    'Jhana Meditation': 'Jhana',
    'Theravada Buddhism': 'Theravada',
    'Zen Buddhism': 'Zen',
    'Tibetan Buddhism': 'Tibetan_Buddhism',
    'Body Scan': 'Mindfulness#Body_scan',
    'Progressive Muscle Relaxation': 'Progressive_muscle_relaxation',
    'Yoga Nidra': 'Yoga_nidra',
    'Christian Contemplation': 'Christian_meditation',
    'Centering Prayer': 'Centering_prayer',
    'Lectio Divina': 'Lectio_Divina',
    'Ignatian Spirituality': 'Ignatian_spirituality',
    'Sufi Meditation': 'Sufism',
    'Kabbalah': 'Kabbalah',
    'Stoic Philosophy': 'Stoicism',
    'Advaita Vedanta': 'Advaita_Vedanta',
    'Internal Family Systems (IFS)': 'Internal_Family_Systems_Model',
    'Internal Family Systems': 'Internal_Family_Systems_Model',
    'IFS': 'Internal_Family_Systems_Model',
    'Mussar': 'Musar_movement',
    'Acceptance and Commitment Therapy (ACT)': 'Acceptance_and_commitment_therapy',
    'Acceptance and Commitment Therapy': 'Acceptance_and_commitment_therapy',
    'ACT': 'Acceptance_and_commitment_therapy',
    'Circling': 'https://www.psychologytoday.com/us/blog/passion/202112/circling-a-personal-perspective-on-finding-genuine-connection'
};

function getWikipediaUrl(traditionName) {
    const mappedName = wikipediaMapping[traditionName] || traditionName;

    // If it's already a full URL, return it as-is
    if (mappedName.startsWith('http://') || mappedName.startsWith('https://')) {
        return mappedName;
    }

    // Otherwise, construct Wikipedia URL
    const urlName = mappedName.replace(/ /g, '_');
    return `https://en.wikipedia.org/wiki/${urlName}`;
}

function renderResults(recommendations) {
    if (recommendations.length === 0) {
        document.getElementById('resultsContainer').innerHTML = '<p>No recommendations found. Please try adjusting your answers.</p>';
        return;
    }

    let html = '<div class="recommendations">';

    recommendations.forEach((rec, index) => {
        const t = rec.tradition;
        const wikipediaUrl = getWikipediaUrl(t.name);

        // Format matched areas into readable text
        const metricLabels = {
            adhd: 'ADHD', depression: 'Depression', anxiety: 'Anxiety', trauma: 'Trauma',
            focus: 'Focus', metacognition: 'Metacognition', insight: 'Insight',
            compassion: 'Compassion', communication: 'Communication', empathy: 'Empathy',
            bodyAwareness: 'Body Awareness', emotionalRegulation: 'Emotional Regulation'
        };
        const matchReasons = rec.matchedAreas.length > 0
            ? rec.matchedAreas.map(m => metricLabels[m] || m).join(', ')
            : 'Good overall match for your goals';

        html += `
            <div class="recommendation-card">
                <div class="recommendation-rank">#${index + 1}</div>
                <h3>${t.name} <a href="${wikipediaUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.8em; color: var(--secondary); text-decoration: none;" title="Learn more on Wikipedia">ⓘ</a></h3>
                <p class="tradition-origin">${t.origin} (${t.yearOrigin > 0 ? t.yearOrigin : Math.abs(t.yearOrigin) + ' BCE'})</p>
                <p>${t.description}</p>
                <div style="background: #e8f4f8; padding: 0.75rem; border-radius: 5px; margin: 1rem 0; border-left: 3px solid var(--secondary);">
                    <strong style="color: var(--primary);">Why recommended:</strong>
                    <span style="color: #2c3e50;"> Particularly effective for ${matchReasons}</span>
                </div>
                <div class="recommendation-details">
                    <div class="detail-item">
                        <strong>Practices:</strong> ${t.practices.join(', ')}
                    </div>
                    <div class="detail-item">
                        <strong>Time commitment:</strong> ${t.timeCommitment}
                    </div>
                    <div class="detail-item">
                        <strong>Guidance needed:</strong> ${t.guidanceNeeded}
                    </div>
                    <div class="detail-item">
                        <strong>Accessibility:</strong> ${t.accessibility}
                    </div>
                    <div class="detail-item">
                        <strong>Research support:</strong> ${t.researchSupport}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    document.getElementById('resultsContainer').innerHTML = html;
}

function renderComparisonTable() {
    if (!traditionsData) return;

    const dimensionFilter = document.getElementById('dimensionFilter').value;

    // Determine which metrics to show
    let metricsToShow = [];
    if (dimensionFilter === 'all') {
        metricsToShow = ['adhd', 'depression', 'anxiety', 'trauma', 'focus', 'metacognition', 'insight',
                        'compassion', 'communication', 'empathy', 'bodyAwareness', 'emotionalRegulation'];
    } else {
        metricsToShow = traditionsData.dimensions[dimensionFilter] || [];
    }

    // Sort traditions if sort column is set
    let sortedTraditions = [...traditionsData.traditions];
    if (sortState.column) {
        sortedTraditions.sort((a, b) => {
            let valA, valB;

            if (sortState.column === 'name') {
                valA = a.name;
                valB = b.name;
            } else if (sortState.column === 'origin') {
                valA = a.origin;
                valB = b.origin;
            } else if (sortState.column === 'yearOrigin') {
                valA = a.yearOrigin;
                valB = b.yearOrigin;
            } else if (sortState.column === 'timeCommitment') {
                valA = a.timeCommitment;
                valB = b.timeCommitment;
            } else if (sortState.column === 'guidanceNeeded') {
                valA = a.guidanceNeeded;
                valB = b.guidanceNeeded;
            } else {
                // Effectiveness score
                valA = a.effectiveness[sortState.column] || 0;
                valB = b.effectiveness[sortState.column] || 0;
            }

            // Compare values
            let comparison = 0;
            if (typeof valA === 'string') {
                comparison = valA.localeCompare(valB);
            } else {
                comparison = valA - valB;
            }

            return sortState.direction === 'asc' ? comparison : -comparison;
        });
    }

    // Create table headers with sort indicators
    let html = '<table><thead><tr>';

    const createSortableHeader = (label, column) => {
        const sortIcon = sortState.column === column
            ? (sortState.direction === 'asc' ? ' ▲' : ' ▼')
            : '';
        return `<th class="sortable" data-column="${column}">${label}${sortIcon}</th>`;
    };

    html += createSortableHeader('Framework', 'name');
    html += createSortableHeader('Origin', 'origin');
    html += createSortableHeader('Guidance', 'guidanceNeeded');

    metricsToShow.forEach(metric => {
        const label = formatMetricName(metric);
        html += createSortableHeader(label, metric);
    });

    html += '</tr></thead><tbody>';

    sortedTraditions.forEach(tradition => {
        html += `<tr data-tradition-id="${tradition.id}">`;
        html += `<td>
            <div class="tradition-name-wrapper">
                <div class="tradition-name">${tradition.name}</div>
                <span class="info-icon">ⓘ</span>
                <div class="tradition-popover">
                    <div class="popover-description">${tradition.description}</div>
                    <div class="popover-practices"><strong>Practices:</strong> ${tradition.practices.join(', ')}</div>
                    <div class="popover-time"><strong>Time/Day:</strong> ${tradition.timeCommitment}</div>
                </div>
            </div>
        </td>`;
        html += `<td><div class="tradition-origin">${tradition.origin}</div></td>`;
        html += `<td>${tradition.guidanceNeeded}</td>`;

        metricsToShow.forEach(metric => {
            const score = tradition.effectiveness[metric] || 0;
            html += `<td><span class="score score-${score}">${score}</span></td>`;
        });

        html += '</tr>';
    });

    html += '</tbody></table>';

    document.getElementById('comparison-table').innerHTML = html;

    // Add click handlers to sortable headers
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.column;

            if (sortState.column === column) {
                // Toggle direction
                sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                // New column
                sortState.column = column;
                sortState.direction = 'desc';
            }

            renderComparisonTable();
        });
    });

    // Position popovers on hover/click
    // Move popovers to body to escape sticky column stacking context
    document.querySelectorAll('.tradition-name-wrapper').forEach(wrapper => {
        const popover = wrapper.querySelector('.tradition-popover');
        if (!popover) return;

        // Move popover to body on first interaction
        let movedToBody = false;
        const moveToBody = () => {
            if (!movedToBody) {
                document.body.appendChild(popover);
                movedToBody = true;
            }
        };

        const showPopover = () => {
            moveToBody();
            const rect = wrapper.getBoundingClientRect();
            const isMobile = window.innerWidth < 768;

            popover.style.display = 'block';

            if (isMobile) {
                // On mobile, CSS handles positioning as bottom sheet
                // Just clear any inline styles that might interfere
                popover.style.left = '';
                popover.style.right = '';
                popover.style.top = '';
                popover.style.width = '';
                popover.style.maxWidth = '';
            } else {
                // On desktop, position to the right
                popover.style.left = `${rect.right + 10}px`;
                popover.style.top = `${rect.top}px`;
                popover.style.right = 'auto';
                popover.style.width = '';
                popover.style.maxWidth = '400px';

                // Ensure popover doesn't go off screen
                requestAnimationFrame(() => {
                    const popoverRect = popover.getBoundingClientRect();
                    if (popoverRect.right > window.innerWidth) {
                        popover.style.left = `${rect.left - popoverRect.width - 10}px`;
                    }
                    if (popoverRect.bottom > window.innerHeight) {
                        popover.style.top = `${Math.max(10, window.innerHeight - popoverRect.height - 10)}px`;
                    }
                });
            }
        };

        const hidePopover = () => {
            popover.style.display = 'none';
        };

        wrapper.addEventListener('mouseenter', showPopover);
        wrapper.addEventListener('mouseleave', hidePopover);
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            if (popover.style.display === 'block') {
                hidePopover();
            } else {
                showPopover();
            }
        });
    });

    // Close popovers when clicking elsewhere
    document.addEventListener('click', () => {
        document.querySelectorAll('.tradition-popover').forEach(p => {
            p.style.display = 'none';
        });
    });
}

function formatMetricName(metric) {
    const names = {
        adhd: 'ADHD',
        depression: 'Depression',
        anxiety: 'Anxiety',
        trauma: 'Trauma',
        focus: 'Focus',
        metacognition: 'Metacognition',
        insight: 'Insight',
        compassion: 'Compassion',
        communication: 'Communication',
        empathy: 'Empathy',
        bodyAwareness: 'Body Awareness',
        emotionalRegulation: 'Emotional Regulation'
    };
    return names[metric] || metric;
}

function renderEvolutionTree() {
    if (!traditionsData) return;

    const width = 1200;
    const height = 600;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // Clear existing
    d3.select('#evolution-tree').html('');

    const svg = d3.select('#evolution-tree')
        .append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Build hierarchy
    const nodes = buildTreeData();

    // Create tree layout
    const treeLayout = d3.tree()
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const root = d3.hierarchy(nodes);
    treeLayout(root);

    // Draw links
    svg.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Draw nodes
    const node = svg.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
        .attr('r', 5);

    node.append('text')
        .attr('dy', 3)
        .attr('x', d => d.children ? -10 : 10)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.name);

    // Add tooltip on hover
    node.append('title')
        .text(d => {
            if (d.data.description) {
                return `${d.data.name}\n${d.data.description}`;
            }
            return d.data.name;
        });
}

function buildTreeData() {
    // Build simplified tree showing evolution and relationships
    return {
        name: 'Ancient Traditions',
        children: [
            {
                name: 'Buddhist (-500)',
                children: [
                    { name: 'Vipassana', description: 'Insight meditation' },
                    { name: 'Jhana', description: 'Concentration states' },
                    { name: 'Metta', description: 'Loving-kindness' },
                    {
                        name: 'Tibetan Buddhism (800)',
                        children: [
                            { name: 'Open Awareness', description: 'Dzogchen practices' }
                        ]
                    }
                ]
            },
            {
                name: 'Jewish (-500)',
                children: [
                    { name: 'Mussar', description: 'Character development' }
                ]
            },
            {
                name: 'Greek Philosophy (-300)',
                children: [
                    { name: 'Stoicism', description: 'Virtue ethics' }
                ]
            },
            {
                name: 'Western Psychology (1900s)',
                children: [
                    {
                        name: 'Humanistic (1950s)',
                        children: [
                            { name: 'Focusing (1978)', description: 'Body-centered awareness' },
                            { name: 'Circling (2005)', description: 'Relational mindfulness' }
                        ]
                    },
                    {
                        name: 'Trauma Therapy (1970s)',
                        children: [
                            { name: 'Somatic Experiencing', description: 'Body-based trauma work' }
                        ]
                    },
                    {
                        name: 'Developmental (1980s)',
                        children: [
                            { name: 'IDP (2010)', description: 'Stage development' }
                        ]
                    }
                ]
            }
        ]
    };
}

// Complexity visualization
let radarChartInstance = null;
let complexitySortState = { column: 'name', direction: 'asc' };

function initializeComplexityView() {
    console.log('Initializing complexity view...');
    if (!traditionsData || !traditionsData.traditions) {
        console.error('No traditions data available');
        return;
    }

    // Count traditions with complexity profiles
    const withProfiles = traditionsData.traditions.filter(t => t.complexityProfile).length;
    console.log(`Found ${withProfiles} traditions with complexity profiles out of ${traditionsData.traditions.length}`);

    // Populate tradition selector
    populateTraditionSelect();

    // Create scatter plot
    createScatterPlot();

    // Populate complexity table
    renderComplexityTable();

    // Set up toggle button handler (only add once)
    const toggleBtn = document.getElementById('toggleTableRows');
    if (toggleBtn && !toggleBtn.dataset.listenerAdded) {
        toggleBtn.addEventListener('click', () => {
            tableDisplayState.showAll = !tableDisplayState.showAll;
            renderComplexityTable();
        });
        toggleBtn.dataset.listenerAdded = 'true';
    }

    // Create violin plot
    createViolinPlot();

    // Set up tradition selector handler (only add once)
    const selector = document.getElementById('traditionSelect');
    const existingListener = selector.dataset.listenerAdded;
    if (!existingListener) {
        selector.addEventListener('change', (e) => {
            if (e.target.value) {
                const tradition = traditionsData.traditions.find(t => t.id === e.target.value);
                selectTradition(tradition);
            }
        });
        selector.dataset.listenerAdded = 'true';
    }

    // Show first tradition by default
    if (traditionsData.traditions.length > 0) {
        const firstTradition = traditionsData.traditions.find(t => t.complexityProfile) || traditionsData.traditions[0];
        selector.value = firstTradition.id;
        selectTradition(firstTradition);
    }
}

function selectTradition(tradition) {
    if (!tradition) return;
    updateRadarChart(tradition);
    createVerticalViolinPlot(tradition);
    showTraditionDetails(tradition);
    highlightTableRow(tradition.id);
}

function showTraditionDetails(tradition) {
    const detailsPanel = document.getElementById('traditionDetails');
    if (!detailsPanel) return;

    detailsPanel.style.display = 'block';
    detailsPanel.querySelector('h4').textContent = tradition.name;
    detailsPanel.querySelector('.origin').textContent = `${tradition.origin} (${tradition.yearOrigin > 0 ? tradition.yearOrigin : Math.abs(tradition.yearOrigin) + ' BCE'})`;
    detailsPanel.querySelector('.description').textContent = tradition.description;
    detailsPanel.querySelector('.time').textContent = tradition.timeCommitment;
    detailsPanel.querySelector('.guidance').textContent = tradition.guidanceNeeded;
    detailsPanel.querySelector('.accessibility').textContent = tradition.accessibility;
}

function highlightTableRow(traditionId) {
    // Remove existing highlights
    document.querySelectorAll('#complexityTableBody tr').forEach(row => {
        row.classList.remove('selected-row');
    });

    // Add highlight to selected row
    const row = document.querySelector(`#complexityTableBody tr[data-tradition-id="${traditionId}"]`);
    if (row) {
        row.classList.add('selected-row');
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function renderComplexityTable() {
    const tbody = document.getElementById('complexityTableBody');
    if (!tbody) return;

    // Get traditions with complexity profiles
    const traditions = traditionsData.traditions.filter(t => t.complexityProfile);

    // Sort traditions
    const sorted = [...traditions].sort((a, b) => {
        const col = complexitySortState.column;
        let aVal, bVal;

        if (col === 'name' || col === 'origin') {
            aVal = a[col];
            bVal = b[col];
            return complexitySortState.direction === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        } else {
            // Complexity dimension
            aVal = a.complexityProfile[col];
            bVal = b.complexityProfile[col];
            return complexitySortState.direction === 'asc'
                ? aVal - bVal
                : bVal - aVal;
        }
    });

    // Limit rows if not showing all
    const displayedTraditions = tableDisplayState.showAll
        ? sorted
        : sorted.slice(0, tableDisplayState.initialRowCount);

    // Update toggle button
    const toggleBtn = document.getElementById('toggleTableRows');
    if (toggleBtn) {
        toggleBtn.textContent = tableDisplayState.showAll ? 'Show Less' : `Show All (${sorted.length})`;
        toggleBtn.style.display = sorted.length <= tableDisplayState.initialRowCount ? 'none' : 'inline-block';
    }

    // Render rows
    tbody.innerHTML = displayedTraditions.map(tradition => {
        const profile = tradition.complexityProfile;
        return `
            <tr data-tradition-id="${tradition.id}" style="cursor: pointer;">
                <td><span class="tradition-name">${tradition.name}</span></td>
                <td class="tradition-origin">${tradition.origin}</td>
                <td><span class="score score-${profile.somatic}">${profile.somatic}</span></td>
                <td><span class="score score-${profile.intrapsychic}">${profile.intrapsychic}</span></td>
                <td><span class="score score-${profile.relational}">${profile.relational}</span></td>
                <td><span class="score score-${profile.collective}">${profile.collective}</span></td>
                <td><span class="score score-${profile.systemic}">${profile.systemic}</span></td>
                <td><span class="score score-${profile.transpersonal}">${profile.transpersonal}</span></td>
            </tr>
        `;
    }).join('');

    // Add click handlers to rows
    tbody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', () => {
            const traditionId = row.dataset.traditionId;
            const tradition = traditionsData.traditions.find(t => t.id === traditionId);
            if (tradition) {
                const selector = document.getElementById('traditionSelect');
                selector.value = tradition.id;
                selectTradition(tradition);
            }
        });
    });

    // Add sort handlers to headers (only once)
    const headers = document.querySelectorAll('#complexityTable th.sortable');
    headers.forEach(header => {
        if (!header.dataset.sortHandlerAdded) {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                if (complexitySortState.column === column) {
                    complexitySortState.direction = complexitySortState.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    complexitySortState.column = column;
                    complexitySortState.direction = 'desc'; // Default to descending for new column
                }
                renderComplexityTable();
            });
            header.dataset.sortHandlerAdded = 'true';
        }
    });
}

function populateTraditionSelect() {
    const selector = document.getElementById('traditionSelect');

    // Sort traditions by name
    const sortedTraditions = [...traditionsData.traditions].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    // Clear existing options except first
    selector.innerHTML = '<option value="">Choose a tradition...</option>';

    // Add all traditions
    sortedTraditions.forEach(tradition => {
        const option = document.createElement('option');
        option.value = tradition.id;
        option.textContent = `${tradition.name} (${tradition.origin})`;
        selector.appendChild(option);
    });
}

function updateRadarChart(tradition) {
    console.log('Updating radar chart for:', tradition?.name);
    if (!tradition || !tradition.complexityProfile) {
        console.warn('No complexity profile for tradition:', tradition?.name);
        return;
    }

    const canvas = document.getElementById('radarChart');
    if (!canvas) {
        console.error('Radar chart canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    const profile = tradition.complexityProfile;

    const data = {
        labels: ['Somatic', 'Intrapsychic', 'Relational', 'Collective', 'Systemic', 'Transpersonal'],
        datasets: [{
            label: tradition.name,
            data: [
                profile.somatic,
                profile.intrapsychic,
                profile.relational,
                profile.collective,
                profile.systemic,
                profile.transpersonal
            ],
            fill: true,
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            borderColor: 'rgb(52, 152, 219)',
            pointBackgroundColor: 'rgb(52, 152, 219)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(52, 152, 219)'
        }]
    };

    const config = {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    };

    // Destroy existing chart if it exists
    if (radarChartInstance) {
        radarChartInstance.destroy();
    }

    console.log('Creating radar chart with data:', data);
    radarChartInstance = new Chart(ctx, config);
}

function createScatterPlot() {
    console.log('Creating scatter plot...');
    if (!traditionsData || !traditionsData.traditions) {
        console.error('No traditions data for scatter plot');
        return;
    }

    // Clear any existing plot
    const container = document.getElementById('scatterPlot');
    if (!container) {
        console.error('Scatter plot container not found');
        return;
    }
    container.innerHTML = '';

    // Calculate average individual vs collective scores for each tradition
    const plotData = traditionsData.traditions
        .filter(t => t.complexityProfile)
        .map(t => {
            const profile = t.complexityProfile;
            // X-axis: Individual focus (somatic + intrapsychic) / 2
            const individual = (profile.somatic + profile.intrapsychic) / 2;
            // Y-axis: Collective/Systemic focus (relational + collective + systemic + transpersonal) / 4
            const collective = (profile.relational + profile.collective + profile.systemic + profile.transpersonal) / 4;
            return {
                name: t.name,
                origin: t.origin,
                x: individual,
                y: collective,
                profile: profile
            };
        });

    console.log(`Creating scatter plot with ${plotData.length} traditions`);

    // Set up SVG with responsive sizing
    const margin = {top: 20, right: 20, bottom: 60, left: 60};
    const containerWidth = container.clientWidth || 600;
    const width = Math.min(containerWidth, 600) - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select('#scatterPlot')
        .append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
        .domain([0, 5])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, 5])
        .range([height, 0]);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append('text')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('fill', 'black')
        .style('text-anchor', 'middle')
        .text('Individual Focus (Somatic + Intrapsychic)');

    svg.append('g')
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('fill', 'black')
        .style('text-anchor', 'middle')
        .text('Social/Systemic Focus');

    // Add tooltip
    const tooltip = d3.select('body')
        .append('div')
        .style('position', 'absolute')
        .style('background', 'white')
        .style('padding', '8px')
        .style('border', '1px solid #ddd')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 1000);

    // Add dots
    svg.selectAll('circle')
        .data(plotData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', 6)
        .style('fill', '#3498db')
        .style('opacity', 0.7)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .style('fill', '#e74c3c')
                .attr('r', 8);

            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`<strong>${d.name}</strong> (${d.origin})<br/>
                Individual: ${d.x.toFixed(1)}<br/>
                Social/Systemic: ${d.y.toFixed(1)}<br/>
                <em style="font-size: 0.9em; color: #7f8c8d;">Click to view profile</em>`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .style('fill', '#3498db')
                .attr('r', 6);

            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function(event, d) {
            // Find the tradition by name
            const tradition = traditionsData.traditions.find(t => t.name === d.name);
            console.log('Clicked scatter point:', d.name, 'Found tradition:', tradition?.id);
            if (tradition) {
                // Update dropdown and trigger change event
                const selector = document.getElementById('traditionSelect');
                selector.value = tradition.id;

                // Dispatch change event to ensure UI updates
                selector.dispatchEvent(new Event('change'));

                // Update all views
                selectTradition(tradition);

                // Visual feedback
                d3.selectAll('circle')
                    .style('fill', '#3498db')
                    .attr('r', 6);
                d3.select(this)
                    .style('fill', '#27ae60')
                    .attr('r', 8);
            }
        });
}

function createViolinPlot() {
    console.log('Creating violin plot...');
    if (!traditionsData || !traditionsData.traditions) {
        console.error('No traditions data for violin plot');
        return;
    }

    const container = document.getElementById('violinPlot');
    if (!container) {
        console.error('Violin plot container not found');
        return;
    }
    container.innerHTML = '';

    const complexity_dims = ['somatic', 'intrapsychic', 'relational', 'collective', 'systemic', 'transpersonal'];

    // Collect data for each dimension
    const dimensionData = complexity_dims.map(dim => {
        const values = traditionsData.traditions
            .filter(t => t.complexityProfile)
            .map(t => t.complexityProfile[dim]);
        return { dimension: dim, values: values };
    });

    // Set up SVG with responsive sizing
    const margin = {top: 20, right: 30, bottom: 80, left: 60};
    const containerWidth = container.clientWidth || 900;
    const width = Math.min(containerWidth, 900) - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#violinPlot')
        .append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale - categorical for dimensions
    const x = d3.scaleBand()
        .domain(complexity_dims)
        .range([0, width])
        .padding(0.2);

    // Y scale - 1 to 5 for complexity scores
    const y = d3.scaleLinear()
        .domain([0, 6])
        .range([height, 0]);

    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '12px');

    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(5));

    // Create violin shapes for each dimension
    dimensionData.forEach(dimData => {
        const values = dimData.values;
        const dimension = dimData.dimension;

        // Calculate histogram bins
        const histogram = d3.bin()
            .domain([0.5, 5.5])
            .thresholds([0.5, 1.5, 2.5, 3.5, 4.5, 5.5])
            (values);

        // Find max bin size for scaling
        const maxNum = d3.max(histogram, h => h.length);

        // X scale for violin width
        const xNum = d3.scaleLinear()
            .domain([0, maxNum])
            .range([0, x.bandwidth() / 2]);

        // Create area generator for violin shape
        const area = d3.area()
            .x0(d => x(dimension) + x.bandwidth() / 2 - xNum(d.length))
            .x1(d => x(dimension) + x.bandwidth() / 2 + xNum(d.length))
            .y(d => y((d.x0 + d.x1) / 2))
            .curve(d3.curveCatmullRom);

        // Draw violin
        svg.append('path')
            .datum(histogram)
            .attr('d', area)
            .style('fill', '#3498db')
            .style('opacity', 0.6)
            .style('stroke', '#2c3e50')
            .style('stroke-width', 1);

        // Add median line
        const median = d3.median(values);
        svg.append('line')
            .attr('x1', x(dimension) + x.bandwidth() / 2 - x.bandwidth() / 4)
            .attr('x2', x(dimension) + x.bandwidth() / 2 + x.bandwidth() / 4)
            .attr('y1', y(median))
            .attr('y2', y(median))
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // Add individual points with jitter
        svg.selectAll(`circle.${dimension}`)
            .data(values)
            .enter()
            .append('circle')
            .attr('cx', () => x(dimension) + x.bandwidth() / 2 + (Math.random() - 0.5) * x.bandwidth() * 0.3)
            .attr('cy', d => y(d))
            .attr('r', 3)
            .style('fill', '#2c3e50')
            .style('opacity', 0.3);
    });

    // Add axis labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 70)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Complexity Dimension');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Complexity Score (1-5)');
}

function createVerticalViolinPlot(tradition) {
    console.log('Creating complexity bar chart for', tradition?.name);
    if (!tradition || !tradition.complexityProfile) {
        console.error('No tradition data for complexity bar chart');
        return;
    }

    const container = document.getElementById('verticalViolinPlot');
    if (!container) {
        console.error('Complexity bar chart container not found');
        return;
    }
    container.innerHTML = '';
    container.style.display = 'block';

    // Dimensions ordered from bottom to top: somatic -> transpersonal
    const complexity_dims = ['somatic', 'intrapsychic', 'relational', 'collective', 'systemic', 'transpersonal'];

    // Set up SVG with responsive sizing
    const isMobile = window.innerWidth <= 768;
    const margin = {
        top: 20,
        right: isMobile ? 15 : 40,
        bottom: 40,
        left: isMobile ? 95 : 120
    };
    const containerWidth = container.clientWidth || 450;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#verticalViolinPlot')
        .append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Y scale - categorical for dimensions (somatic at bottom)
    const y = d3.scaleBand()
        .domain(complexity_dims)
        .range([height, 0])
        .padding(0.3);

    // X scale - use full width, centered at middle
    const centerX = width / 2;
    const maxHalfWidth = width * 0.35; // Max half-width for value 5
    const barScale = d3.scaleLinear()
        .domain([0, 5])
        .range([0, maxHalfWidth]);

    // Add center line
    svg.append('line')
        .attr('x1', centerX)
        .attr('x2', centerX)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#bdc3c7')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.3);

    // Add Y axis with dimension labels
    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '12px')
        .style('text-transform', 'capitalize');

    // Add bars for each dimension (symmetric from center)
    complexity_dims.forEach(dim => {
        const value = tradition.complexityProfile[dim];
        const halfWidth = barScale(value);

        // Color gradient based on value
        const colorScale = d3.scaleLinear()
            .domain([1, 3, 5])
            .range(['#e74c3c', '#f39c12', '#27ae60']);

        // Draw symmetric bar (extends left and right from center)
        svg.append('rect')
            .attr('x', centerX - halfWidth)
            .attr('y', y(dim))
            .attr('width', halfWidth * 2)
            .attr('height', y.bandwidth())
            .attr('fill', colorScale(value))
            .attr('opacity', 0.8)
            .attr('rx', 3);

        // Add value labels on both sides
        svg.append('text')
            .attr('x', centerX - halfWidth - 8)
            .attr('y', y(dim) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#7f8c8d')
            .text(value);

        svg.append('text')
            .attr('x', centerX + halfWidth + 8)
            .attr('y', y(dim) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#7f8c8d')
            .text(value);
    });
}

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    // Handle "Other" source field visibility
    const sourceSelect = document.getElementById('contact-source');
    const sourceOtherGroup = document.getElementById('contact-source-other-group');
    if (sourceSelect && sourceOtherGroup) {
        sourceSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Other') {
                sourceOtherGroup.style.display = 'block';
            } else {
                sourceOtherGroup.style.display = 'none';
            }
        });
    }

    // Combined contact/signup form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const messageDiv = document.getElementById('contact-form-message');

            // Disable button and show loading
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            messageDiv.className = 'form-message';
            messageDiv.textContent = '';

            try {
                const formData = new FormData(contactForm);

                // Get source value - use sourceOther if "Other" is selected
                let source = formData.get('source');
                if (source === 'Other') {
                    const otherValue = formData.get('sourceOther');
                    source = otherValue ? `Other: ${otherValue}` : 'Other';
                }

                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formData.get('email'),
                        name: formData.get('name'),
                        message: formData.get('message'),
                        subscribe: formData.get('subscribe') === 'on',
                        source: source
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.className = 'form-message success';
                    messageDiv.textContent = data.message;
                    contactForm.reset();
                } else {
                    throw new Error(data.error || 'Failed to submit');
                }
            } catch (error) {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = error.message || 'An error occurred. Please try again.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit';
            }
        });
    }
});

// Attention mechanism classification
function renderAttentionClassification() {
    if (!traditionsData || !traditionsData.traditions) return;

    // Simplified classification based on practice characteristics
    const attentionTypes = {
        'Focused Attention (FA)': [],
        'Open Monitoring (OM)': [],
        'Non-Dual Awareness (NDA)': [],
        'Hybrid/Mixed': []
    };

    // Classification heuristics based on practice names and characteristics
    traditionsData.traditions.forEach(t => {
        const name = t.name.toLowerCase();

        // FA practices - concentration on single object
        if (name.includes('jhana') || name.includes('samadhi') || name.includes('mantra') ||
            name.includes('breath') || name.includes('tm') || name.includes('transcendental')) {
            attentionTypes['Focused Attention (FA)'].push(t);
        }
        // NDA practices - non-dual awareness
        else if (name.includes('dzogchen') || name.includes('mahamudra') || name.includes('open awareness') ||
                 name.includes('advaita') || name.includes('non-dual')) {
            attentionTypes['Non-Dual Awareness (NDA)'].push(t);
        }
        // OM practices - open monitoring
        else if (name.includes('vipassana') || name.includes('mindfulness') || name.includes('insight') ||
                 name.includes('noting') || name.includes('choiceless')) {
            attentionTypes['Open Monitoring (OM)'].push(t);
        }
        // Everything else as hybrid
        else {
            attentionTypes['Hybrid/Mixed'].push(t);
        }
    });

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">';

    Object.entries(attentionTypes).forEach(([type, practices]) => {
        const colorMap = {
            'Focused Attention (FA)': { bg: '#e3f2fd', border: '#2196f3', text: '#1976d2' },
            'Open Monitoring (OM)': { bg: '#f3e5f5', border: '#9c27b0', text: '#7b1fa2' },
            'Non-Dual Awareness (NDA)': { bg: '#fce4ec', border: '#e91e63', text: '#c2185b' },
            'Hybrid/Mixed': { bg: '#f5f5f5', border: '#757575', text: '#424242' }
        };
        const colors = colorMap[type];

        html += `
            <div style="background: ${colors.bg}; padding: 1.5rem; border-radius: 8px; border-left: 4px solid ${colors.border};">
                <h4 style="margin: 0 0 1rem 0; color: ${colors.text};">${type}</h4>
                <div style="font-size: 0.9rem;">
                    ${practices.length > 0
                        ? practices.slice(0, 10).map(p => `<div style="margin: 0.5rem 0;">${p.name}</div>`).join('')
                        : '<div style="color: #888;">No practices classified yet</div>'}
                    ${practices.length > 10 ? `<div style="margin-top: 0.5rem; color: #666; font-style: italic;">...and ${practices.length - 10} more</div>` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';

    document.getElementById('attentionClassification').innerHTML = html;
}

// Research Section
let researchData = null;

async function initializeResearchSection() {
    try {
        const response = await fetch('data/score-justifications.json');
        researchData = await response.json();
        populateResearchDropdown();
    } catch (error) {
        console.error('Failed to load research data:', error);
        document.getElementById('researchContent').innerHTML = '<p style="color: #e74c3c;">Failed to load research data.</p>';
    }
}

function populateResearchDropdown() {
    const select = document.getElementById('researchTraditionSelect');
    if (!select || !researchData) return;

    // Get tradition names from the research data
    const traditions = Object.keys(researchData.traditions).sort((a, b) => {
        const nameA = traditionsData?.traditions.find(t => t.id === a)?.name || a;
        const nameB = traditionsData?.traditions.find(t => t.id === b)?.name || b;
        return nameA.localeCompare(nameB);
    });

    traditions.forEach(id => {
        const tradition = traditionsData?.traditions.find(t => t.id === id);
        const name = tradition?.name || id;
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        select.appendChild(option);
    });

    select.addEventListener('change', () => {
        renderResearchContent(select.value);
    });
}

function renderResearchContent(traditionId) {
    const container = document.getElementById('researchContent');
    if (!traditionId || !researchData) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">Select a tradition above to view research justifications.</p>';
        return;
    }

    const data = researchData.traditions[traditionId];
    if (!data) {
        container.innerHTML = '<p style="color: #e74c3c;">No research data found for this tradition.</p>';
        return;
    }

    const tradition = traditionsData?.traditions.find(t => t.id === traditionId);
    const name = tradition?.name || traditionId;

    const confidenceColor = {
        high: '#27ae60',
        medium: '#f39c12',
        low: '#e74c3c'
    };

    let html = `
        <h3 style="margin-bottom: 0.5rem;">${name}</h3>
        <p style="margin-bottom: 0.5rem;">
            <strong>Overall Confidence:</strong>
            <span style="color: ${confidenceColor[data.overallConfidence]}; font-weight: 600;">
                ${data.overallConfidence.charAt(0).toUpperCase() + data.overallConfidence.slice(1)}
            </span>
        </p>
        <p style="margin-bottom: 1.5rem; color: #666;">${data.researchBasis}</p>

        <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: var(--primary); color: white;">
                    <th style="padding: 0.75rem; text-align: left;">Dimension</th>
                    <th style="padding: 0.75rem; text-align: center;">Score</th>
                    <th style="padding: 0.75rem; text-align: center;">Confidence</th>
                    <th style="padding: 0.75rem; text-align: left;">Justification</th>
                </tr>
            </thead>
            <tbody>
    `;

    const dimensionNames = {
        adhd: 'ADHD',
        depression: 'Depression',
        anxiety: 'Anxiety',
        trauma: 'Trauma',
        focus: 'Focus',
        metacognition: 'Metacognition',
        insight: 'Insight',
        compassion: 'Compassion',
        communication: 'Communication',
        empathy: 'Empathy',
        bodyAwareness: 'Body Awareness',
        emotionalRegulation: 'Emotional Regulation'
    };

    Object.entries(data.scores).forEach(([dimension, scoreData]) => {
        const concerns = scoreData.concerns ? `<br><em style="color: #e67e22; font-size: 0.85rem;">⚠ ${scoreData.concerns}</em>` : '';
        const citations = scoreData.keyCitations ? `<br><span style="color: #666; font-size: 0.85rem;">📚 ${scoreData.keyCitations.join(', ')}</span>` : '';

        html += `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 0.75rem; font-weight: 500;">${dimensionNames[dimension] || dimension}</td>
                <td style="padding: 0.75rem; text-align: center;">
                    <span class="score score-${scoreData.score}">${scoreData.score}</span>
                </td>
                <td style="padding: 0.75rem; text-align: center;">
                    <span style="color: ${confidenceColor[scoreData.confidence]}; font-weight: 600;">
                        ${scoreData.confidence.charAt(0).toUpperCase() + scoreData.confidence.slice(1)}
                    </span>
                </td>
                <td style="padding: 0.75rem; font-size: 0.9rem;">
                    ${scoreData.justification}${concerns}${citations}
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';

    container.innerHTML = html;
}
