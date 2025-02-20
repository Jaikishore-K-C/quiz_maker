/* js/script.js */

// === Utility Functions for localStorage ===

// Get users from localStorage (or return an empty object if none exist)
function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || {};
}

// Save users object to localStorage
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Get quizzes from localStorage (or return an empty array if none exist)
function getQuizzes() {
  return JSON.parse(localStorage.getItem('quizzes')) || [];
}

// Save quizzes array to localStorage
function saveQuizzes(quizzes) {
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
}

// === Element Selections ===
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');

const createQuizForm = document.getElementById('create-quiz-form');
const addQuestionBtn = document.getElementById('add-question-btn');
const questionsContainer = document.getElementById('questions-container');

const quizSelect = document.getElementById('quiz-select');
const startQuizBtn = document.getElementById('start-quiz-btn');
const quizArea = document.getElementById('quiz-area');
const quizTitleDisplay = document.getElementById('quiz-title-display');
const quizQuestionsDiv = document.getElementById('quiz-questions');
const quizForm = document.getElementById('quiz-form');
const quizResultDiv = document.getElementById('quiz-result');

// Variable to store the current logged-in user
let currentUser = null;

// === Toggle Between Login and Register Sections ===
showRegisterLink.addEventListener('click', () => {
  loginSection.style.display = 'none';
  registerSection.style.display = 'block';
});

showLoginLink.addEventListener('click', () => {
  registerSection.style.display = 'none';
  loginSection.style.display = 'block';
});

// === Login Functionality ===
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  
  const users = getUsers();
  if (users[username] && users[username].password === password) {
    currentUser = username;
    alert('Login successful!');
    showDashboard();
  } else {
    alert('Invalid username or password.');
  }
});

// === Register Functionality ===
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  
  let users = getUsers();
  if (users[username]) {
    alert('Username already exists.');
  } else {
    // Save the new user
    users[username] = { password: password };
    saveUsers(users);
    alert('Registration successful! You can now log in.');
    // Switch to login view
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
  }
});

// === Logout Functionality ===
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  dashboardSection.style.display = 'none';
  loginSection.style.display = 'block';
  // For simplicity, reload the page to clear any dynamic content.
  location.reload();
});

// === Show Dashboard After Successful Login ===
function showDashboard() {
  userDisplay.textContent = currentUser;
  loginSection.style.display = 'none';
  registerSection.style.display = 'none';
  dashboardSection.style.display = 'block';
  loadQuizOptions(); // Populate the quiz dropdown
}

// === Quiz Creation Functionality ===

// When user clicks "Add Question", dynamically add a new question block
addQuestionBtn.addEventListener('click', () => {
  const questionDiv = document.createElement('div');
  questionDiv.classList.add('question');

  // Input for the question text
  const questionInput = document.createElement('input');
  questionInput.type = 'text';
  questionInput.placeholder = 'Question text';
  questionInput.required = true;
  questionDiv.appendChild(questionInput);

  // Input for the correct answer
  const answerInput = document.createElement('input');
  answerInput.type = 'text';
  answerInput.placeholder = 'Correct answer';
  answerInput.required = true;
  questionDiv.appendChild(answerInput);

  // Button to remove this question if needed
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remove Question';
  removeBtn.addEventListener('click', () => {
    questionsContainer.removeChild(questionDiv);
  });
  questionDiv.appendChild(removeBtn);

  questionsContainer.appendChild(questionDiv);
});

// When the quiz creation form is submitted, gather the quiz details and save it
createQuizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('quiz-title').value.trim();
  if (!title) {
    alert('Please enter a quiz title.');
    return;
  }
  
  const questionsElements = questionsContainer.querySelectorAll('.question');
  const questions = [];
  questionsElements.forEach(qDiv => {
    const inputs = qDiv.querySelectorAll('input');
    const questionText = inputs[0].value.trim();
    const correctAnswer = inputs[1].value.trim();
    if (questionText && correctAnswer) {
      questions.push({
        question: questionText,
        answer: correctAnswer
      });
    }
  });
  
  if (questions.length === 0) {
    alert('Please add at least one question.');
    return;
  }
  
  // Retrieve existing quizzes and add the new one
  let quizzes = getQuizzes();
  quizzes.push({
    title: title,
    questions: questions,
    creator: currentUser
  });
  saveQuizzes(quizzes);
  alert('Quiz saved successfully!');

  // Reset the form for a new quiz
  createQuizForm.reset();
  questionsContainer.innerHTML = '';

  // Update the quiz dropdown options
  loadQuizOptions();
});

// === Load Quiz Options for Taking a Quiz ===
function loadQuizOptions() {
  quizSelect.innerHTML = ''; // Clear any existing options
  const quizzes = getQuizzes();
  quizzes.forEach((quiz, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = quiz.title;
    quizSelect.appendChild(option);
  });
}

// === Quiz Taking Functionality ===

// When the "Start Quiz" button is clicked, load the selected quiz into the quiz area
startQuizBtn.addEventListener('click', () => {
  const selectedIndex = quizSelect.value;
  const quizzes = getQuizzes();
  if (quizzes[selectedIndex]) {
    startQuiz(quizzes[selectedIndex]);
  } else {
    alert('Please select a valid quiz.');
  }
});

// Function to display the quiz questions for the user to answer
function startQuiz(quiz) {
  quizArea.style.display = 'block';
  quizTitleDisplay.textContent = quiz.title;
  quizQuestionsDiv.innerHTML = ''; // Clear any previous questions

  // For each question, create a label and an input field
  quiz.questions.forEach((q, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('quiz-question');

    const questionLabel = document.createElement('label');
    questionLabel.textContent = (index + 1) + '. ' + q.question;
    questionDiv.appendChild(questionLabel);

    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.placeholder = 'Your answer';
    answerInput.required = true;
    // Store the correct answer in a data attribute (we’ll compare later)
    answerInput.setAttribute('data-correct', q.answer);
    questionDiv.appendChild(answerInput);

    quizQuestionsDiv.appendChild(questionDiv);
  });

  quizResultDiv.innerHTML = ''; // Clear any previous result
}

// When the quiz form is submitted, check the answers and display the score
quizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const answerInputs = quizQuestionsDiv.querySelectorAll('input');
  let score = 0;
  answerInputs.forEach(input => {
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = input.getAttribute('data-correct').trim().toLowerCase();
    if (userAnswer === correctAnswer) {
      score++;
      input.style.borderColor = 'green'; // Visual feedback for correct answer
    } else {
      input.style.borderColor = 'red';   // Visual feedback for incorrect answer
    }
  });
  quizResultDiv.textContent = `You scored ${score} out of ${answerInputs.length}.`;
});
