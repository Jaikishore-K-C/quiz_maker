Below is an extremely detailed, step‐by‐step guide—including all the code—to help you build a simple Quiz Maker web application using HTML, CSS, and JavaScript (with data stored in localStorage). This project will let users register and log in, create quizzes by adding custom questions, and then take those quizzes with real-time scoring feedback.

## Step 1: Set Up Your Project Folder

1. **Create a folder** named `quiz-maker` (or any name you like).
2. **Inside the folder**, create these subfolders and files:
   ```
   quiz-maker/
     index.html
     css/
       style.css
     js/
       script.js
   ```

---

## Step 2: Build the HTML Structure

We’ll create a single-page application that shows different sections (login, register, dashboard) depending on what the user is doing.

Open `index.html` and add the following code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quiz Maker</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <!-- Login Section -->
  <section id="login-section">
    <h2>Login</h2>
    <form id="login-form">
      <input type="text" id="login-username" placeholder="Username" required />
      <input type="password" id="login-password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <a href="#" id="show-register">Register here</a></p>
  </section>

  <!-- Register Section -->
  <section id="register-section" style="display: none;">
    <h2>Register</h2>
    <form id="register-form">
      <input type="text" id="register-username" placeholder="Username" required />
      <input type="password" id="register-password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <p>Already have an account? <a href="#" id="show-login">Login here</a></p>
  </section>

  <!-- Dashboard Section -->
  <section id="dashboard-section" style="display: none;">
    <h2>Welcome, <span id="user-display"></span>!</h2>
    <button id="logout-btn">Logout</button>

    <!-- Create Quiz Section -->
    <div id="create-quiz-section">
      <h3>Create a Quiz</h3>
      <form id="create-quiz-form">
        <input type="text" id="quiz-title" placeholder="Quiz Title" required />
        <div id="questions-container">
          <!-- Questions will be added here dynamically -->
        </div>
        <button type="button" id="add-question-btn">Add Question</button>
        <button type="submit">Save Quiz</button>
      </form>
    </div>

    <!-- Take Quiz Section -->
    <div id="take-quiz-section">
      <h3>Take a Quiz</h3>
      <select id="quiz-select">
        <!-- Quiz options will be added dynamically -->
      </select>
      <button id="start-quiz-btn">Start Quiz</button>
    </div>

    <!-- Quiz Area (for taking quiz) -->
    <div id="quiz-area" style="display: none;">
      <h3 id="quiz-title-display"></h3>
      <form id="quiz-form">
        <div id="quiz-questions">
          <!-- Quiz questions will appear here -->
        </div>
        <button type="submit">Submit Quiz</button>
      </form>
      <div id="quiz-result"></div>
    </div>
  </section>

  <script src="js/script.js"></script>
</body>
</html>
```

**Explanation:**

- **Login Section:** Contains a form where users enter their username and password. A link at the bottom lets users switch to the register view.
- **Register Section:** Similar to the login section but for new user registration. It is hidden by default (`style="display: none;"`).
- **Dashboard Section:** Displays after a successful login. It shows:
  - A welcome message (with the logged-in username).
  - A logout button.
  - A quiz creation form where users can add a quiz title and add multiple questions.
  - A section for taking a quiz (with a dropdown to select from saved quizzes).
  - A quiz area that dynamically displays the quiz questions when a quiz is started.

---

## Step 3: Add CSS Styling

Create and open the file `css/style.css`, then add the following styles:

```css
/* css/style.css */

body {
  font-family: Arial, sans-serif;
  margin: 20px;
  background-color: #f5f5f5;
}

section {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2, h3 {
  margin-top: 0;
}

form input, form button, select {
  display: block;
  margin-bottom: 10px;
  padding: 8px;
  width: 100%;
  max-width: 300px;
  box-sizing: border-box;
}

button {
  cursor: pointer;
}

#questions-container .question {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
}
```

**What this does:**

- Sets a clean, modern look with a light background and some padding.
- Styles forms and buttons for a consistent layout.
- Adds a box-shadow to each section for depth.
- Provides a simple style for the dynamically created question blocks.

---

## Step 4: Add JavaScript Functionality

Create and open the file `js/script.js`, then add the code below. Each part has detailed comments to help you understand what’s happening.

```js
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
```

**Explanation of the JavaScript Code:**

1. **Utility Functions:**  
   - `getUsers`/`saveUsers` handle reading and writing the users’ data to localStorage.  
   - `getQuizzes`/`saveQuizzes` do the same for quizzes.

2. **Element Selections:**  
   We grab every key element (forms, sections, buttons) using `document.getElementById` for later use.

3. **Login & Registration:**  
   - The login form checks the entered username and password against those stored in localStorage.  
   - The registration form creates a new user (if the username doesn’t already exist) and stores it.
   - Toggling between the login and registration views is handled via event listeners on the links.

4. **Dashboard:**  
   After a successful login, we show the dashboard (and update the welcome message). The dashboard contains both the quiz creation and quiz taking functionalities.

5. **Quiz Creation:**  
   - Clicking **“Add Question”** dynamically adds a new question block (with a question text and correct answer input).  
   - When the quiz creation form is submitted, we gather the quiz title and all questions, then save the quiz into localStorage.

6. **Quiz Taking:**  
   - The quiz dropdown (`<select>`) is populated from the saved quizzes.  
   - When the user clicks **“Start Quiz”**, the selected quiz’s questions are rendered into the quiz area.
   - On submitting the quiz, the app compares the user’s answers with the correct answers, highlights them (green for correct, red for incorrect), and displays the score.

---

## Step 5: Run and Test Your Application

1. **Open your project folder.**
2. **Double-click `index.html`** to open it in your web browser.
3. **Test the workflow:**
   - **Register a New User:** Switch to the register view and create an account.
   - **Login:** Use your new account credentials.
   - **Create a Quiz:** Enter a quiz title, click “Add Question” one or more times, fill in the question and its answer, and then save the quiz.
   - **Take a Quiz:** Select the quiz you created from the dropdown, click “Start Quiz,” answer the questions, and then submit to see your score and visual feedback.
