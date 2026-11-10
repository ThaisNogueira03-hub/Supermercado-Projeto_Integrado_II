

let percentualFonte =
  Number(
    localStorage.getItem(
      "AnhanveraTamanho"
    )
  ) || 100;


document.addEventListener(
  "DOMContentLoaded",
  iniciarAcessibilidade
);


function iniciarAcessibilidade() {

  criarBarraAcessibilidade();

  carregarPreferencias();

}


function criarBarraAcessibilidade() {

  const cabecalho =
  document.querySelector(
    ".acessibilidade-slot"
  ) ||
  document.querySelector(
    ".cabecalho"
  );


  if (!cabecalho) {
    return;
  }


  const barra =
    document.createElement(
      "div"
    );


  barra.className =
    "barra-acessibilidade";


  barra.setAttribute(
    "aria-label",
    "Opções de acessibilidade"
  );


  barra.innerHTML = `

    <button
      type="button"
      id="diminuirFonte"
      class="botao-acessibilidade"
      aria-label="Diminuir tamanho"
      title="Diminuir tamanho"
    >
      A−
    </button>


    <button
      type="button"
      id="percentualFonte"
      class="percentual-fonte"
      title="Voltar para 100%"
    >
      100%
    </button>


    <button
      type="button"
      id="aumentarFonte"
      class="botao-acessibilidade"
      aria-label="Aumentar tamanho"
      title="Aumentar tamanho"
    >
      A+
    </button>


    <button
  type="button"
  id="botaoEscuro"
  class="botao-acessibilidade botao-tema"
  aria-label="Alternar modo escuro"
  title="Modo escuro"
>

  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3
      7 7 0 0 0 21 12.79z"
    ></path>
  </svg>

  <span class="texto-controle">
    Modo escuro
  </span>

</button>

  `;


  cabecalho.appendChild(
    barra
  );


  document
    .getElementById(
      "aumentarFonte"
    )
    .addEventListener(
      "click",
      aumentarFonte
    );


  document
    .getElementById(
      "diminuirFonte"
    )
    .addEventListener(
      "click",
      diminuirFonte
    );


  document
    .getElementById(
      "percentualFonte"
    )
    .addEventListener(
      "click",
      restaurarFonte
    );


  document
    .getElementById(
      "botaoEscuro"
    )
    .addEventListener(
      "click",
      alternarModoEscuro
    );

}


function aumentarFonte() {

  percentualFonte += 10;


  salvarTamanho();

  aplicarTamanho();

}


function diminuirFonte() {

  if (
    percentualFonte <= 50
  ) {

    return;

  }


  percentualFonte -= 10;


  salvarTamanho();

  aplicarTamanho();

}


function restaurarFonte() {

  percentualFonte = 100;


  salvarTamanho();

  aplicarTamanho();

}

function aplicarTamanho() {

  document
    .documentElement
    .style
    .setProperty(
      "--escala-interface",
      percentualFonte / 100
    );


  const visor =
    document.getElementById(
      "percentualFonte"
    );


  if (visor) {

    visor.textContent =
      `${percentualFonte}%`;

  }

}


function salvarTamanho() {

  localStorage.setItem(
    "AnhanveraTamanho",
    percentualFonte
  );

}


function alternarModoEscuro() {

  document.body
    .classList
    .toggle(
      "modo-escuro"
    );


  const ativo =
    document.body
      .classList
      .contains(
        "modo-escuro"
      );


  localStorage.setItem(
    "AnhanveraModoEscuro",
    ativo
  );


  atualizarBotaoTema();

}


function carregarPreferencias() {

  const modoEscuro =
    localStorage.getItem(
      "AnhanveraModoEscuro"
    ) === "true";


  if (modoEscuro) {

    document.body
      .classList
      .add(
        "modo-escuro"
      );

  }


  aplicarTamanho();

  atualizarBotaoTema();

}


function atualizarBotaoTema() {

  const botao =
    document.getElementById(
      "botaoEscuro"
    );


  if (!botao) return;


  const ativo =
    document.body
      .classList
      .contains(
        "modo-escuro"
      );


  botao.classList.toggle(
    "ativo",
    ativo
  );


  botao.setAttribute(
    "aria-pressed",
    ativo
  );

}