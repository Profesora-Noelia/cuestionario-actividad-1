function checkAnswers() {
  let score = 0;
  const totalQuestions = questions.length;

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

  // Calcular porcentaje
  const percentage = (score / totalQuestions) * 100;
  let feedbackMessage = `Tu puntaje es: ${score} de ${totalQuestions}\n`;

  // Mensaje de retroalimentación dependiendo del porcentaje
  if (percentage < 80) {
    feedbackMessage += "Desaprobaste la actividad. Intenta nuevamente.";
  } else {
    feedbackMessage += "¡Aprobaste la actividad! ¡Felicidades!";
  }

  // Mostrar mensaje en la página
  const feedbackContainer = document.getElementById("feedback-container");
  feedbackContainer.innerText = feedbackMessage;
}

// Función para imprimir la evidencia del quiz
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

  // Calcular puntaje final y porcentaje
  let score = 0;
  const totalQuestions = questions.length;
  questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="question${index}"]:checked`);
    if (selected && selected.value === q.correctAnswer) {
      score++;
    }
  });

  const percentage = (score / totalQuestions) * 100;

  // Mostrar puntaje y retroalimentación general en el PDF
  doc.setFontSize(14);
  doc.text(`Puntaje final: ${score} de ${totalQuestions}`, 10, yPosition);
  yPosition += 10;
  doc.text(`Porcentaje: ${percentage.toFixed(2)}%`, 10, yPosition);
  yPosition += 10;

  // Agregar retroalimentación general (Aprobado o Desaprobado)
  if (percentage >= 80) {
    doc.setTextColor(0, 128, 0); // Verde para aprobado
    doc.text("¡Felicidades! Aprobaste la actividad.", 10, yPosition);
  } else {
    doc.setTextColor(255, 0, 0); // Rojo para desaprobado
    doc.text("Lo siento, no aprobaste la actividad.", 10, yPosition);
  }

  // Guardar el archivo PDF
  doc.save("evidencia_quiz.pdf");
}

// Llamar a la función para cargar las preguntas
loadQuestions();
