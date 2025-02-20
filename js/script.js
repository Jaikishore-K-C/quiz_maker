/* js/script.js */

// === Utility Functions for localStorage ===
function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || {};
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getQuizzes() {
  return JSON.parse(localStorage.getItem('quizzes')) || [];
}

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

let currentUser = null;

// === Toggle Between Login and Register ===
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
    users[username] = { password: password };
    saveUsers(users);
    alert('Registration successful! You can now log in.');
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
  }
});

// === Logout Functionality ===
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  dashboardSection.style.display = 'none';
  loginSection.style.display = 'block';
  location.reload();
});

// === Show Dashboard ===
function showDashboard() {
  userDisplay.textContent = currentUser;
  loginSection.style.display = 'none';
  registerSection.style.display = 'none';
  dashboardSection.style.display = 'block';
  loadQuizOptions();
}

// === Quiz Creation Functionality ===

// Helper: Create a new question block
function createQuestionBlock() {
  const questionDiv = document.createElement('div');
  questionDiv.classList.add('question');

  // Dropdown for selecting question type
  const typeSelect = document.createElement('select');
  typeSelect.innerHTML = `
    <option value="text">Text Question</option>
    <option value="mc">Multiple Choice</option>
  `;
  questionDiv.appendChild(typeSelect);

  // Common input: Question text
  const questionInput = document.createElement('input');
  questionInput.type = 'text';
  questionInput.placeholder = 'Enter question text';
  questionInput.required = true;
  questionDiv.appendChild(questionInput);

  // Container for answer inputs; will change based on type
  const answerContainer = document.createElement('div');
  answerContainer.classList.add('answer-container');
  questionDiv.appendChild(answerContainer);

  // Initially add text answer input (default for "text" type)
  function loadTextAnswer() {
    answerContainer.innerHTML = '';
    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.placeholder = 'Enter correct answer';
    answerInput.required = true;
    answerContainer.appendChild(answerInput);
  }

  // For multiple choice: allow multiple options with radio buttons to mark the correct answer
  function loadMultipleChoice() {
    answerContainer.innerHTML = '';
    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('multiple-choice-options');
    answerContainer.appendChild(optionsDiv);

    // Button to add an option
    const addOptionBtn = document.createElement('button');
    addOptionBtn.type = 'button';
    addOptionBtn.textContent = 'Add Option';
    addOptionBtn.style.marginTop = '10px';
    answerContainer.appendChild(addOptionBtn);

    // Function to add an option input
    function addOption() {
      const optionDiv = document.createElement('div');
      optionDiv.classList.add('option');

      // Radio button to mark correct option (name must be unique per question)
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'correct-' + Date.now(); // unique name for each multiple choice set
      radio.required = true;
      optionDiv.appendChild(radio);

      // Option text input
      const optionInput = document.createElement('input');
      optionInput.type = 'text';
      optionInput.placeholder = 'Option text';
      optionInput.required = true;
      optionDiv.appendChild(optionInput);

      // Remove option button
      const removeOptionBtn = document.createElement('button');
      removeOptionBtn.type = 'button';
      removeOptionBtn.textContent = 'Remove';
      removeOptionBtn.addEventListener('click', () => {
        optionsDiv.removeChild(optionDiv);
      });
      optionDiv.appendChild(removeOptionBtn);

      optionsDiv.appendChild(optionDiv);
    }

    // Add one default option
    addOption();

    addOptionBtn.addEventListener('click', addOption);
  }

  // Load default answer input (text question)
  loadTextAnswer();

  // Change answer UI based on question type selection
  typeSelect.addEventListener('change', () => {
    if (typeSelect.value === 'text') {
      loadTextAnswer();
    } else if (typeSelect.value === 'mc') {
      loadMultipleChoice();
    }
  });

  // Remove question button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remove Question';
  removeBtn.style.position = 'absolute';
  removeBtn.style.top = '10px';
  removeBtn.style.right = '10px';
  removeBtn.addEventListener('click', () => {
    questionsContainer.removeChild(questionDiv);
  });
  questionDiv.appendChild(removeBtn);

  return questionDiv;
}

addQuestionBtn.addEventListener('click', () => {
  const newQuestionBlock = createQuestionBlock();
  questionsContainer.appendChild(newQuestionBlock);
});

// Save the quiz
createQuizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('quiz-title').value.trim();
  if (!title) {
    alert('Please enter a quiz title.');
    return;
  }

  const questionBlocks = questionsContainer.querySelectorAll('.question');
  const questions = [];

  questionBlocks.forEach(block => {
    const typeSelect = block.querySelector('select').value;
    const questionText = block.querySelector('input[type="text"]').value.trim();
    if (!questionText) return;

    if (typeSelect === 'text') {
      // Text question: get the answer input from the answer container
      const answerInput = block.querySelector('.answer-container input[type="text"]');
      if (!answerInput || !answerInput.value.trim()) return;
      questions.push({
        type: 'text',
        question: questionText,
        answer: answerInput.value.trim()
      });
    } else if (typeSelect === 'mc') {
      // Multiple Choice: collect all options and mark which one is correct
      const optionsDiv = block.querySelector('.multiple-choice-options');
      const optionDivs = optionsDiv.querySelectorAll('.option');
      const options = [];
      let correctAnswer = null;
      optionDivs.forEach(optDiv => {
        const radio = optDiv.querySelector('input[type="radio"]');
        const optionInput = optDiv.querySelector('input[type="text"]');
        if (optionInput && optionInput.value.trim()) {
          options.push(optionInput.value.trim());
          if (radio.checked) {
            correctAnswer = optionInput.value.trim();
          }
        }
      });
      if (options.length < 2 || !correctAnswer) return;
      questions.push({
        type: 'mc',
        question: questionText,
        options: options,
        answer: correctAnswer
      });
    }
  });

  if (questions.length === 0) {
    alert('Please add at least one valid question.');
    return;
  }

  let quizzes = getQuizzes();
  quizzes.push({
    title: title,
    questions: questions,
    creator: currentUser
  });
  saveQuizzes(quizzes);
  alert('Quiz saved successfully!');
  createQuizForm.reset();
  questionsContainer.innerHTML = '';
  loadQuizOptions();
});

// === Load Quiz Options ===
function loadQuizOptions() {
  quizSelect.innerHTML = '';
  const quizzes = getQuizzes();
  quizzes.forEach((quiz, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = quiz.title;
    quizSelect.appendChild(option);
  });
}

// === Quiz Taking Functionality ===
startQuizBtn.addEventListener('click', () => {
  const selectedIndex = quizSelect.value;
  const quizzes = getQuizzes();
  if (quizzes[selectedIndex]) {
    startQuiz(quizzes[selectedIndex]);
  } else {
    alert('Please select a valid quiz.');
  }
});

function startQuiz(quiz) {
  quizArea.style.display = 'block';
  quizTitleDisplay.textContent = quiz.title;
  quizQuestionsDiv.innerHTML = '';

  quiz.questions.forEach((q, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('quiz-question');
    const questionLabel = document.createElement('label');
    questionLabel.textContent = (index + 1) + '. ' + q.question;
    questionDiv.appendChild(questionLabel);

    if (q.type === 'text') {
      // For text questions, simple text input
      const answerInput = document.createElement('input');
      answerInput.type = 'text';
      answerInput.placeholder = 'Your answer';
      answerInput.required = true;
      answerInput.setAttribute('data-correct', q.answer);
      questionDiv.appendChild(answerInput);
    } else if (q.type === 'mc') {
      // For multiple choice, render radio buttons for each option
      q.options.forEach(optionText => {
        const optionDiv = document.createElement('div');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'question-' + index;
        radio.value = optionText;
        radio.required = true;
        optionDiv.appendChild(radio);

        const label = document.createElement('label');
        label.textContent = optionText;
        optionDiv.appendChild(label);

        questionDiv.appendChild(optionDiv);
      });
      // Store correct answer as data attribute on the container
      questionDiv.setAttribute('data-correct', q.answer);
    }
    quizQuestionsDiv.appendChild(questionDiv);
  });

  quizResultDiv.innerHTML = '';
}

quizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let score = 0;
  const totalQuestions = quizQuestionsDiv.querySelectorAll('.quiz-question').length;
  const questions = quizQuestionsDiv.querySelectorAll('.quiz-question');

  questions.forEach((qDiv, index) => {
    if (qDiv.querySelector('input[type="text"]')) {
      // Text question
      const input = qDiv.querySelector('input[type="text"]');
      const userAnswer = input.value.trim().toLowerCase();
      const correctAnswer = input.getAttribute('data-correct').trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        score++;
        input.style.borderColor = 'green';
      } else {
        input.style.borderColor = 'red';
      }
    } else if (qDiv.querySelectorAll('input[type="radio"]').length > 0) {
      // Multiple choice question
      const selected = qDiv.querySelector('input[type="radio"]:checked');
      const correctAnswer = qDiv.getAttribute('data-correct').trim().toLowerCase();
      if (selected && selected.value.trim().toLowerCase() === correctAnswer) {
        score++;
        selected.parentElement.style.backgroundColor = '#c8e6c9';
      } else if (selected) {
        selected.parentElement.style.backgroundColor = '#ffcdd2';
      }
    }
  });

  quizResultDiv.textContent = `You scored ${score} out of ${totalQuestions}.`;
});