/* =========================================================
   HOME DO TOTEM
========================================================= */


/* =========================
   DATA E HORA
========================= */

function atualizarDataHora() {

  const agora =
    new Date();


  const elementoData =
    document.getElementById(
      "dataAtual"
    );


  const elementoHora =
    document.getElementById(
      "horaAtual"
    );


  if (elementoData) {

    let data =
      new Intl.DateTimeFormat(
        "pt-BR",
        {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      )
        .format(
          agora
        );


    /*
      deixa a primeira letra maiúscula
    */

    data =
      data.charAt(0)
        .toUpperCase()
      +
      data.slice(1);


    elementoData.textContent =
      data;

  }


  if (elementoHora) {

    elementoHora.textContent =
      new Intl.DateTimeFormat(
        "pt-BR",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }
      )
        .format(
          agora
        );

  }

}


/* =========================
   TOTEM
========================= */

function iniciarTotemHome() {

  const botoes =
    document.querySelectorAll(
      ".botao-totem-home"
    );


  const status =
    document.getElementById(
      "totemSelecionadoHome"
    );


  if (
    botoes.length === 0
  ) {

    return;

  }


  const salvo =
    sessionStorage.getItem(
      "anhanveraTotemSelecionado"
    );


  function selecionarTotem(
    numero
  ) {

    botoes.forEach(
      function (botao) {

        const ativo =
          botao.dataset.totem ===
          numero;


        botao
          .classList
          .toggle(
            "ativo",
            ativo
          );


        botao.setAttribute(
          "aria-pressed",
          ativo
        );

      }
    );


    sessionStorage.setItem(
      "anhanveraTotemSelecionado",
      numero
    );


    if (status) {

      status.innerHTML = `

        <div class="totem-check">
          ✓
        </div>

        <div>

          <strong>
            Totem ${numero} selecionado
          </strong>

          <span>
            como ponto de partida.
          </span>

        </div>

      `;

    }

  }


  botoes.forEach(
    function (botao) {

      botao.addEventListener(
        "click",
        function () {

          selecionarTotem(
            botao.dataset.totem
          );

        }
      );

    }
  );


  if (salvo) {

    selecionarTotem(
      salvo
    );

  }

}


/* =========================
   INICIAR
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    atualizarDataHora();

    iniciarTotemHome();


    /*
      atualiza hora a cada 20 segundos
    */

    setInterval(
      atualizarDataHora,
      20000
    );

  }
);