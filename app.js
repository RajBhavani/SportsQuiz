var QUESTIONS = [
  {
      text: "Which former Sun's player went to college at Arizona State University?",
      choices: [
          "Jason Kidd",
          "Steve Nash",
          "Amare Stoudemire",
          "Charles Barkley",
            ],
      correctChoiceIndex: 0,
      
    },
  
    {
      text: "How many Nba teams has Lebron James played for?",
      choices: [
          "1",
          "2",
          "3",
          "4"
          ],
      correctChoiceIndex: 1,
    },
    {
      text: "Which NBA player has a father who played in the NBA?",
      choices: [
          "Michael Jordan",
          "Stephen Curry",
          "Carmello Anthony",
          "Lebron James"
        ],
      correctChoiceIndex: 1,
    },
    {
      text: "Which former NBA player scored 101 points in a single game?",
      choices: [
          "Kareem Abdul-Jabar",
          "Michael Jordan",
          "Magic Johnson",
          "Wilt Chamberlain"
          ],
      correctChoiceIndex: 3,
    },
    {
      text: "How tall was the shortests NBA player?",
      choices: [
          "5'9\"",
          "5'5\"",
          "5'3\"",
          "5'7\""
      ],
      correctChoiceIndex: 2,
    },
];


// objects
var Quiz = {

  score: 0,
  questions: [],
  currentQuestionIndex: 0,

  // we'll call this method below in this file
  // in the functions that deal with inserting
  // content into the DOM.
  currentQuestion: function() {
    return this.questions[this.currentQuestionIndex]
  },

  // ditto here: this is also used to generate content
  // that will be inserted into the DOM below.
  answerFeedbackHeader: function(isCorrect) {
    return isCorrect ? "<h6 class='user-was-correct'>correct</h6>" :
      "<h1 class='user-was-incorrect'>Wrooonnnngggg!</>";
  },

  // this method is used to generate text on
  // whether or not the user guessed correctly.
  // if they are correct, the feedback text will
  // be randomly chosen from `praises`, and if they're
  // incorrect, it will be randomly chosen from
  // `admonishments`.
  answerFeedbackText: function(isCorrect) {

    var praises = [
      "Good job, you have no life",
      "Correct. Which would be impressive, if I cared",
      "Fine, you are right. Stop gloating"
    ];

    var admonishments = [
        "Pick up a book and try reading for once"
    ];

    // another tenrary operator
    var choices = isCorrect ? praises : admonishments;
    return choices[Math.floor(Math.random() * choices.length)];

  },

  seeNextText: function() {
    return this.currentQuestionIndex <
      this.questions.length - 1 ? "Next" : "How did I do?";

  },

  questionCountText: function() {
    return (this.currentQuestionIndex + 1) + "/" +
      this.questions.length + ": ";
  },

  finalFeedbackText: function() {
    return "You got " + this.score + " out of " +
      this.questions.length + " questions right.";
  },

  // this method compares the user's answer to
  // the correct answer for the current question
  scoreUserAnswer: function(answer) {
    var correctChoice = this.currentQuestion().choices[this.currentQuestion().correctChoiceIndex];
    if (answer === correctChoice) {
      this.score ++;
    }
    return answer === correctChoice;
  }
}

// factory method for creating
// a new quiz.
function getNewQuiz() {
  var quiz = Object.create(Quiz);
  // `QUESTIONS` is defined at the top of this file
  quiz.questions = QUESTIONS;
  return quiz
}




function makeCurrentQuestionElem(quiz) {

  var questionElem = $("#js-question-template" ).children().clone();
  var question = quiz.currentQuestion();

  questionElem.find(".js-question-count").text(quiz.questionCountText());
  questionElem.find('.js-question-text').text(question.text);

  // add choices as radio inputs
  for (var i = 0; i < question.choices.length; i++) {

    var choice = question.choices[i];
    var choiceElem = $( "#js-choice-template" ).children().clone();
    choiceElem.find("input").attr("value", choice);
    var choiceId = "js-question-" + quiz.currentQuestionIndex + "-choice-" + i;
    choiceElem.find("input").attr("id", choiceId)
    choiceElem.find("label").text(choice);
    choiceElem.find("label").attr("for", choiceId);
    questionElem.find(".js-choices").append(choiceElem);
  };

  return questionElem;
}

function makeAnswerFeedbackElem(isCorrect, correctAnswer, quiz) {
  var feedbackElem = $("#js-answer-feedback-template").children().clone();
  feedbackElem.find(".js-feedback-header").html(
    quiz.answerFeedbackHeader(isCorrect));
  feedbackElem.find(".js-feedback-text").text(
    quiz.answerFeedbackText(isCorrect));
  feedbackElem.find(".js-see-next").text(quiz.seeNextText());
  return feedbackElem;
}

function makeFinalFeedbackElem(quiz) {
  var finalFeedbackElem = $("#js-final-feedback-template").clone();
  finalFeedbackElem.find(".js-results-text").text(quiz.finalFeedbackText());
  return finalFeedbackElem;
}


function handleSeeNext(quiz, currentQuestionElem) {

  $("main").on("click", ".js-see-next", function(event) {

    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
      // manually remove event listener on the `.js-see-next` because they
      // otherwise continue occuring for previous, inactive questions
      $("main").off("click", ".js-see-next");
      quiz.currentQuestionIndex ++;
      $("main").html(makeCurrentQuestionElem(quiz));
    }
    else {
      $("main").html(makeFinalFeedbackElem(quiz))
    }
  });
}

// listen for when user submits answer to a question
function handleAnswers(quiz) {
  $("main").on("submit", "form[name='current-question']", function(event) {
    event.preventDefault();
    var answer = $("input[name='user-answer']:checked").val();
    quiz.scoreUserAnswer(answer);
    var question = quiz.currentQuestion();
    var correctAnswer = question.choices[question.correctChoiceIndex]
    var isCorrect = answer === correctAnswer;
    handleSeeNext(quiz);
    $("main").html(makeAnswerFeedbackElem(isCorrect, correctAnswer, quiz));
  });
}

// display the quiz start content, and listen for
// when the user clicks "start quiz"
function handleQuizStart() {
  $("main").html($("#js-start-template").clone());
  $("form[name='game-start']").submit(function(event) {
    var quiz = getNewQuiz();
    event.preventDefault();
    $("main").html(makeCurrentQuestionElem(quiz));
    handleAnswers(quiz);
    handleRestarts();
  });
}

// listen for when the user indicates they want to
// restart the game.
function handleRestarts() {
  $("main").on("click", ".js-restart-game", function(event){
    event.preventDefault();
    // this removes all event listeners from `<main>` cause we want them
    // set afresh by `handleQuizStart`
    $("main").off();
    handleQuizStart();
  });
}

$(document).ready(function() {
  handleQuizStart();
});
