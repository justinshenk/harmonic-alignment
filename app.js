// Load traditions data
let traditionsData = null;

// Sort state
let sortState = {
    column: 'yearOrigin',
    direction: 'desc' // Reverse chronological (newest first)
};

// Table display state
let tableDisplayState = {
    showAll: false,
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

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeNavigation();
    initializeQuiz();
    renderComparisonTable();
    renderEvolutionTree();
});

async function loadData() {
    // Try CSV first
    try {
        console.log('Loading data from CSV...');
        traditionsData = await loadFromCSV();
        console.log('✓ Loaded from CSV');
        return;
    } catch (error) {
        console.warn('Failed to load from CSV, falling back...', error);
    }

    // Fallback to local JSON
    try {
        const response = await fetch('data/traditions.json');
        traditionsData = await response.json();
        console.log('✓ Loaded from local JSON');
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
        complexityView: 'complexity-section',
        treeView: 'tree-section',
        aboutView: 'about-section'
    };

    Object.keys(buttons).forEach(buttonId => {
        document.getElementById(buttonId).addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
            document.getElementById(buttonId).classList.add('active');

            // Update active section
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            document.getElementById(buttons[buttonId]).classList.add('active');

            // Initialize complexity visualizations when switching to that view
            if (buttonId === 'complexityView') {
                initializeComplexityView();
            }
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

function restartQuiz() {
    document.getElementById('quiz-results').classList.remove('active');
    document.getElementById('quiz-intro').classList.add('active');
}

function renderQuestion() {
    const question = quizState.questions[quizState.currentQuestion];
    const totalQuestions = quizState.questions.length;

    document.getElementById('questionNumber').textContent = `Question ${quizState.currentQuestion + 1} of ${totalQuestions}`;

    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((quizState.currentQuestion + 1) / totalQuestions) * 100;
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
    document.getElementById('prevQuestion').style.display = quizState.currentQuestion > 0 ? 'inline-block' : 'none';
    document.getElementById('nextQuestion').textContent = quizState.currentQuestion === totalQuestions - 1 ? 'See Results' : 'Next';

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
    if (quizState.currentQuestion > 0) {
        quizState.currentQuestion--;
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

    if (quizState.currentQuestion < quizState.questions.length - 1) {
        quizState.currentQuestion++;
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

function renderResults(recommendations) {
    if (recommendations.length === 0) {
        document.getElementById('resultsContainer').innerHTML = '<p>No recommendations found. Please try adjusting your answers.</p>';
        return;
    }

    let html = '<div class="recommendations">';

    recommendations.forEach((rec, index) => {
        const t = rec.tradition;

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
                <h3>${t.name}</h3>
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
    html += '<th>Description</th>';
    html += '<th>Practices</th>';
    html += createSortableHeader('Origin', 'origin');
    html += createSortableHeader('Time/Day', 'timeCommitment');
    html += createSortableHeader('Guidance', 'guidanceNeeded');

    metricsToShow.forEach(metric => {
        const label = formatMetricName(metric);
        html += createSortableHeader(label, metric);
    });

    html += '</tr></thead><tbody>';

    sortedTraditions.forEach(tradition => {
        html += '<tr>';
        html += `<td><div class="tradition-name">${tradition.name}</div></td>`;
        html += `<td>${tradition.description}</td>`;
        html += `<td>${tradition.practices.join(', ')}</td>`;
        html += `<td><div class="tradition-origin">${tradition.origin}</div></td>`;
        html += `<td>${tradition.timeCommitment}</td>`;
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
                sortState.direction = 'asc';
            }

            renderComparisonTable();
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

    // Set up SVG
    const margin = {top: 20, right: 20, bottom: 60, left: 60};
    const width = 600 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select('#scatterPlot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
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

    // Set up SVG
    const margin = {top: 20, right: 30, bottom: 80, left: 60};
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#violinPlot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
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

    // Set up SVG
    const margin = {top: 20, right: 40, bottom: 40, left: 120};
    const width = 450 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#verticalViolinPlot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
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
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = signupForm.querySelector('button[type="submit"]');
            const messageDiv = document.getElementById('signup-message');

            // Disable button and show loading
            submitButton.disabled = true;
            submitButton.textContent = 'Signing up...';
            messageDiv.className = 'form-message';
            messageDiv.textContent = '';

            try {
                const formData = new FormData(signupForm);

                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formData.get('email'),
                        name: formData.get('name')
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.className = 'form-message success';
                    messageDiv.textContent = data.message;
                    signupForm.reset();
                } else {
                    throw new Error(data.error || 'Failed to sign up');
                }
            } catch (error) {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = error.message || 'An error occurred. Please try again.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
            }
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const messageDiv = document.getElementById('contact-message');

            // Disable button and show loading
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            messageDiv.className = 'form-message';
            messageDiv.textContent = '';

            try {
                const formData = new FormData(contactForm);

                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formData.get('email'),
                        name: formData.get('name'),
                        message: formData.get('message')
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.className = 'form-message success';
                    messageDiv.textContent = data.message;
                    contactForm.reset();
                } else {
                    throw new Error(data.error || 'Failed to send message');
                }
            } catch (error) {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = error.message || 'An error occurred. Please try again.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        });
    }
});
