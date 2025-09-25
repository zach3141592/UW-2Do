// Import configuration
import { config } from './config.js';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const tasksContainer = document.getElementById('tasksContainer');
const allTasksContainer = document.getElementById('allTasksContainer');
const currentDate = document.getElementById('currentDate');

// Global variables
let selectedFile = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupNavigation();
});

function initializeApp() {
    // Set current date
    const today = new Date();
    currentDate.textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Set up event listeners
    setupEventListeners();
}

function setupNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section and scroll to it
            const href = this.getAttribute('href');
            const targetSection = document.querySelector(href);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Set up scroll spy to update active nav link :)
    setupScrollSpy();
}

function setupScrollSpy() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to corresponding nav link
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: '-50% 0px -50% 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

function setupEventListeners() {
    // File upload events
    fileInput.addEventListener('change', handleFileSelect);
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    
    // File management events
    removeFile.addEventListener('click', handleRemoveFile);
    analyzeBtn.addEventListener('click', handleAnalyze);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files } });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!config.ALLOWED_FILE_TYPES.includes(file.type)) {
        showError('Please upload a PDF, PNG, JPG, DOCX, or HTML file.');
        return;
    }

    // Validate file size
    if (file.size > config.MAX_FILE_SIZE) {
        showError('File size must be less than 10MB.');
        return;
    }

    selectedFile = file;
    fileName.textContent = file.name;
    
    // Hide upload area and show file info
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'block';
}

function handleRemoveFile() {
    selectedFile = null;
    fileInput.value = '';
    fileName.textContent = '';
    
    // Show upload area and hide file info
    uploadArea.style.display = 'block';
    fileInfo.style.display = 'none';
    
    // Hide results if shown
    hideAllSections();
}

async function handleAnalyze() {
    if (!selectedFile) {
        showError('Please select a file first.');
        return;
    }

    // Check if API key is configured
    if (!config.OPENAI_API_KEY) {
        showError('OpenAI API key not configured. Please check your .env file.');
        return;
    }

    try {
        showLoading();
        
        // Read file content
        const fileContent = await readFileContent(selectedFile);
        
        // Analyze with OpenAI
        const tasks = await analyzeWithOpenAI(fileContent);
        
        // Process and display results
        displayResults(tasks);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError('Failed to analyze the syllabus. Please try again.');
    }
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

async function analyzeWithOpenAI(content) {
    const prompt = `
You are an academic assistant helping students track assignment due dates. Analyze the following syllabus content and extract all assignments, exams, projects, and their due dates.

Current date: ${new Date().toISOString().split('T')[0]}

Please return a JSON array of tasks in the following format:
[
  {
    "title": "Assignment name",
    "description": "Brief description of the assignment",
    "dueDate": "YYYY-MM-DD",
    "type": "assignment|exam|project|quiz|discussion"
  }
]

Important guidelines:
1. Only include items with specific due dates
2. Convert relative dates (like "Week 3" or "next Friday") to actual dates based on the current date
3. If no year is specified, assume the current year or next year if the date has passed
4. Include brief but informative descriptions
5. Categorize each item by type

Syllabus content:
${content}
`;

    const response = await fetch(config.OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.3
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content_text = data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = content_text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('No valid JSON found in OpenAI response');
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        throw new Error('Failed to parse OpenAI response as JSON');
    }
}

function displayResults(tasks) {
    if (!tasks || tasks.length === 0) {
        showError('No assignments or due dates found in the syllabus.');
        return;
    }

    // Sort tasks by due date
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Get current date for comparison
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + config.URGENT_DAYS_THRESHOLD);

    // Filter urgent tasks (within 7 days)
    const urgentTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate <= oneWeekFromNow;
    });

    // Clear previous results
    tasksContainer.innerHTML = '';
    allTasksContainer.innerHTML = '';

    // Display urgent tasks
    if (urgentTasks.length > 0) {
        urgentTasks.forEach(task => {
            const taskElement = createTaskElement(task, true);
            tasksContainer.appendChild(taskElement);
        });
    } else {
        tasksContainer.innerHTML = '<p style="text-align: center; color: #6b7280; font-style: italic;">No urgent tasks in the next 7 days! 🎉</p>';
    }

    // Display all tasks
    tasks.forEach(task => {
        const taskElement = createTaskElement(task, false);
        allTasksContainer.appendChild(taskElement);
    });

    showResults();
}

function createTaskElement(task, isUrgent) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-card';

    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Determine urgency class
    let urgencyClass = 'normal';
    if (diffDays < 0) {
        urgencyClass = 'urgent'; // Overdue
    } else if (diffDays <= 2) {
        urgencyClass = 'urgent';
    } else if (diffDays <= 7) {
        urgencyClass = 'warning';
    }

    taskDiv.classList.add(urgencyClass);

    // Format due date
    const formattedDate = dueDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Days until text
    let daysUntilText;
    if (diffDays < 0) {
        daysUntilText = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
        daysUntilText = 'Due today!';
    } else if (diffDays === 1) {
        daysUntilText = 'Due tomorrow';
    } else {
        daysUntilText = `${diffDays} days until due`;
    }

    taskDiv.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-due-date">📅 Due: ${formattedDate}</div>
        <div class="task-description">${task.description || 'No additional details provided.'}</div>
        <div class="days-until">${daysUntilText}</div>
    `;

    return taskDiv;
}

function showLoading() {
    hideAllSections();
    loadingSection.style.display = 'block';
}

function showResults() {
    hideAllSections();
    resultsSection.style.display = 'block';
}

function showError(message) {
    hideAllSections();
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

function hideAllSections() {
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

function resetApp() {
    hideAllSections();
    handleRemoveFile();
}

// Utility function to handle file type icons
function getFileTypeIcon(type) {
    switch (type) {
        case 'assignment':
            return '📝';
        case 'exam':
            return '📊';
        case 'project':
            return '🔨';
        case 'quiz':
            return '❓';
        case 'discussion':
            return '💬';
        default:
            return '📋';
    }
}

// Error handling for network issues
window.addEventListener('online', function() {
    console.log('Network connection restored');
});

window.addEventListener('offline', function() {
    showError('No internet connection. Please check your network and try again.');
});
