let questions = [];

// Cargar preguntas desde el archivo JSON
function loadQuestions() {
  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      questions = data.questions;
      renderQuestions();
    });
}

// Renderizar todas las preguntas en la página
function renderQuestions() {
  const container = document.getElementById("quiz-questions");
  questions.forEach((q, index) => {
    const qContainer = document.createElement("div");
    qContainer.className = "question-container";
    qContainer.id = "question-" + index;

    // Texto de la pregunta
    const questionText = document.createElement("div");
    questionText.className = "question-text";
    questionText.innerText = (index + 1) + ". " + q.question;
    qContainer.appendChild(questionText);

    // Opciones
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "options-container";
    q.options.forEach(option => {
      const label = document.createElement("label");
      label.className = "option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "question" + index;
      input.value = option;
      label.appendChild(input);

      const span = document.createElement("span");
      span.innerText = option;
      label.appendChild(span);

      optionsContainer.appendChild(label);
    });
    qContainer.appendChild(optionsContainer);

    // Contenedor para feedback (inicialmente oculto)
    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = "feedback";
    feedbackDiv.id = "feedback-" + index;
    qContainer.appendChild(feedbackDiv);

    container.appendChild(qContainer);
  });
}

// Evaluar respuestas y mostrar retroalimentación
function checkAnswers() {
  let score = 0;
  questions.forEach((q, index) => {
    const feedbackDiv = document.getElementById("feedback-" + index);
    const selected = document.querySelector(`input[name="question${index}"]:checked`);
    if (selected) {
      if (selected.value === q.correctAnswer) {
        feedbackDiv.innerText = "¡Correcto! " + q.feedback;
        feedbackDiv.style.backgroundColor = "var(--feedback-correct)";
        score++;
      } else {
        feedbackDiv.innerText = "Incorrecto. " + q.feedback;
        feedbackDiv.style.backgroundColor = "var(--feedback-incorrect)";
      }
    } else {
      feedbackDiv.innerText = "No se ha seleccionado ninguna opción.";
      feedbackDiv.style.backgroundColor = "var(--accent-color)";
    }
    feedbackDiv.style.display = "block";
  });

  const name = document.getElementById("name").value;
  const surname = document.getElementById("surname").value;
  saveScore(name, surname, score, questions.length);
  alert(`Tu puntaje es: ${score} de ${questions.length}`);
}

// Guardar puntaje en Google Sheets
function saveScore(name, surname, score, total) {
  if (!name || !surname) {
    alert("Por favor, ingrese su nombre y apellido antes de enviar las respuestas.");
    return;
  }

  let data = { name, surname, score, total };

  fetch("https://script.google.com/macros/s/AKfycbwMbTsXHXjJ6cSUr7pLEwO8qM_LyIOXcZ9JVjRC5IGmiauDzl33zBP_mPb8eMQV_tjs/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  }).then(response => response.text())
    .then(result => console.log("Enviado a Google Sheets:", result))
    .catch(error => console.error("Error:", error));
}

function printEvidence() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPosition = 10;
    
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    doc.setFontSize(14);
    doc.text(`Nombre: ${name} ${surname}`, 10, yPosition);
    yPosition += 10;
    doc.text("Resultados del Quiz:", 10, yPosition);
    yPosition += 10;
  
    questions.forEach((q, index) => {
      const selected = document.querySelector(`input[name="question${index}"]:checked`);
      let answer = selected ? selected.value : "Sin respuesta";
      const feedbackDiv = document.getElementById("feedback-" + index);
      let feedbackText = feedbackDiv && feedbackDiv.innerText ? feedbackDiv.innerText : "";
  
      let questionLines = doc.splitTextToSize((index + 1) + ". " + q.question, 180);
      let answerLines = doc.splitTextToSize("Respuesta seleccionada: " + answer, 180);
      let feedbackLines = doc.splitTextToSize("Retroalimentación: " + feedbackText, 180);
  
      if (yPosition + questionLines.length * 7 + answerLines.length * 7 + feedbackLines.length * 7 > 270) {
        doc.addPage();
        yPosition = 10;
      }
  
      doc.setFontSize(12);
      doc.text(questionLines, 10, yPosition);
      yPosition += questionLines.length * 7;
      doc.text(answerLines, 10, yPosition);
      yPosition += answerLines.length * 7;
      doc.text(feedbackLines, 10, yPosition);
      yPosition += feedbackLines.length * 7 + 5;
    });
  
    doc.save("evidencia_quiz.pdf");
  }
  

loadQuestions();
