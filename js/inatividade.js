
const TEMPO_INATIVIDADE =
  3 * 60 * 1000;


let temporizadorInatividade;


function reiniciarTemporizadorInatividade() {

  clearTimeout(
    temporizadorInatividade
  );


  temporizadorInatividade =
    setTimeout(
      function() {

        window.location.href =
          "index.html";

      },
      TEMPO_INATIVIDADE
    );

}


/* Qualquer interação reinicia os 3 minutos */

[
  "click",
  "mousemove",
  "keydown",
  "touchstart",
  "scroll",
  "atividadeVoz"
]
  .forEach(
    function(evento) {

      document.addEventListener(
        evento,
        reiniciarTemporizadorInatividade,
        {
          passive: true
        }
      );

    }
  );


reiniciarTemporizadorInatividade();