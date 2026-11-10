/* =========================================================
   SUPERMERCADO Anhanvera
   ASSISTENTE DE NAVEGAÇÃO POR VOZ
   ========================================================= */

let reconhecimentoAssistente = null;

let modoVozAtivo = false;

let assistenteFalando = false;

let indiceProdutoVoz = -1;

let ultimaFalaAssistente = "";


/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    criarBotaoAssistente();

    prepararReconhecimento();

    /*
      Se o usuário já estava usando
      o modo voz e mudou de página,
      mantém o modo ativado.
    */

    const estavaAtivo =
      sessionStorage.getItem(
        "AnhanveraModoVoz"
      ) === "true";


    if (estavaAtivo) {

      setTimeout(
        function () {

          ativarModoVoz(false);

        },
        700
      );

    }


    /*
      Verifica se existe uma busca
      enviada de outra página.
    */

    executarBuscaPendente();

  }
);


/* =========================
   BOTÃO NO CABEÇALHO
========================= */

function criarBotaoAssistente() {

  const barra =
    document.querySelector(
      ".barra-acessibilidade"
    );


  if (!barra) {

    return;

  }


  if (
    document.getElementById(
      "botaoAssistenteVoz"
    )
  ) {

    return;

  }


  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";


  botao.id =
    "botaoAssistenteVoz";


  botao.className =
    "botao-acessibilidade botao-assistente-voz";


  botao.title =
    "Navegação guiada por voz";


  botao.setAttribute(
    "aria-label",
    "Ativar navegação guiada por voz"
  );


  botao.innerHTML = `

    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >

      <path
        d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"
      ></path>

      <path
        d="M19 10v2a7 7 0 0 1-14 0v-2"
      ></path>

      <line
        x1="12"
        y1="19"
        x2="12"
        y2="22"
      ></line>

    </svg>

    <span class="texto-controle">
  Acesso por voz
</span>

  `;


  barra.appendChild(
    botao
  );


  botao.addEventListener(
    "click",
    function () {

      if (modoVozAtivo) {

        desativarModoVoz();

      } else {

        ativarModoVoz(true);

      }

    }
  );

}


/* =========================
   SPEECH RECOGNITION
========================= */

function prepararReconhecimento() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    const botao =
      document.getElementById(
        "botaoAssistenteVoz"
      );


    if (botao) {

      botao.disabled = true;

      botao.title =
        "Navegação por voz não disponível neste navegador.";

    }


    return;

  }


  reconhecimentoAssistente =
    new SpeechRecognition();


  reconhecimentoAssistente.lang =
    "pt-BR";


  reconhecimentoAssistente.continuous =
    false;


  reconhecimentoAssistente.interimResults =
    false;


  reconhecimentoAssistente.maxAlternatives =
    1;


  reconhecimentoAssistente.onstart =
    function () {

      atualizarEstadoMicrofone(
        true
      );

    };


  reconhecimentoAssistente.onresult =
    function (evento) {

      const texto =
        evento
          .results[0][0]
          .transcript
          .trim();


      registrarAtividadeVoz();


      processarComando(
        texto
      );

    };


  reconhecimentoAssistente.onerror =
    function (evento) {

      atualizarEstadoMicrofone(
        false
      );


      if (
        evento.error ===
        "not-allowed"
      ) {

        modoVozAtivo =
          false;


        sessionStorage.removeItem(
          "AnhanveraModoVoz"
        );


        alert(
          "É necessário permitir o uso do microfone para utilizar a navegação guiada por voz."
        );

      }

    };


  reconhecimentoAssistente.onend =
    function () {

      atualizarEstadoMicrofone(
        false
      );


      if (
        modoVozAtivo &&
        !assistenteFalando
      ) {

        setTimeout(
          iniciarEscuta,
          500
        );

      }

    };

}


/* =========================
   ATIVAR
========================= */

function ativarModoVoz(
  primeiraAtivacao = true
) {

  if (
    !reconhecimentoAssistente
  ) {

    alert(
      "A navegação por voz não está disponível neste navegador."
    );

    return;

  }


  modoVozAtivo =
    true;


  sessionStorage.setItem(
    "AnhanveraModoVoz",
    "true"
  );


  atualizarBotaoAssistente();


  /*
    Evita dois reconhecimentos de voz
    funcionando ao mesmo tempo,
    caso exista o microfone da busca.
  */

  const botaoBuscaVoz =
    document.getElementById(
      "botaoVozBusca"
    );


  if (botaoBuscaVoz) {

    botaoBuscaVoz.disabled =
      true;

  }


  let mensagem =
    mensagemInicialPagina();


  if (
    primeiraAtivacao
  ) {

    mensagem =
      "Navegação guiada por voz ativada. " +
      mensagem;

  }


  falarAssistente(
    mensagem
  );

}


/* =========================
   DESATIVAR
========================= */

function desativarModoVoz() {

  modoVozAtivo =
    false;


  sessionStorage.removeItem(
    "AnhanveraModoVoz"
  );


  pararReconhecimento();


  window
    .speechSynthesis
    .cancel();


  assistenteFalando =
    false;


  atualizarBotaoAssistente();


  const botaoBuscaVoz =
    document.getElementById(
      "botaoVozBusca"
    );


  if (botaoBuscaVoz) {

    botaoBuscaVoz.disabled =
      false;

  }

}


/* =========================
   ESCUTA
========================= */

function iniciarEscuta() {

  if (
    !modoVozAtivo ||
    assistenteFalando ||
    !reconhecimentoAssistente
  ) {

    return;

  }


  try {

    reconhecimentoAssistente.start();

  }

  catch (erro) {

    /*
      Evita erro caso o navegador
      já esteja ouvindo.
    */

  }

}


function pararReconhecimento() {

  if (
    !reconhecimentoAssistente
  ) {

    return;

  }


  try {

    reconhecimentoAssistente.abort();

  }

  catch (erro) {

    /*
      Ignora se já estiver parado.
    */

  }

}


/* =========================
   FALA DO ASSISTENTE
========================= */

function falarAssistente(
  texto,
  continuarOuvindo = true
) {

  if (!texto) {

    return;

  }


  ultimaFalaAssistente =
    texto;


  pararReconhecimento();


  window
    .speechSynthesis
    .cancel();


  assistenteFalando =
    true;


  const fala =
    new SpeechSynthesisUtterance(
      texto
    );


  fala.lang =
    "pt-BR";


  fala.rate =
    0.9;


  fala.pitch =
    1;


  fala.volume =
    1;


  const vozes =
    window
      .speechSynthesis
      .getVoices();


  const vozBrasil =
    vozes.find(
      function (voz) {

        return (
          voz.lang &&
          voz.lang
            .toLowerCase()
            .includes(
              "pt-br"
            )
        );

      }
    );


  if (vozBrasil) {

    fala.voice =
      vozBrasil;

  }


  fala.onend =
    function () {

      assistenteFalando =
        false;


      if (
        modoVozAtivo &&
        continuarOuvindo
      ) {

        setTimeout(
          iniciarEscuta,
          400
        );

      }

    };


  fala.onerror =
    function () {

      assistenteFalando =
        false;


      if (
        modoVozAtivo
      ) {

        setTimeout(
          iniciarEscuta,
          400
        );

      }

    };


  window
    .speechSynthesis
    .speak(
      fala
    );

}


/* =========================
   NORMALIZAR COMANDOS
========================= */

function normalizarComando(
  texto
) {

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[.,!?]/g,
      ""
    )
    .trim();

}


/* =========================
   PROCESSAR COMANDOS
========================= */

function processarComando(
  textoOriginal
) {

  const comando =
    normalizarComando(
      textoOriginal
    );


  console.log(
    "Comando de voz:",
    comando
  );


  /* DESATIVAR */

  if (
    comando.includes(
      "desativar voz"
    ) ||
    comando.includes(
      "desativar modo voz"
    ) ||
    comando.includes(
      "sair do modo voz"
    )
  ) {

    falarAssistente(
      "Navegação por voz desativada.",
      false
    );


    setTimeout(
      desativarModoVoz,
      900
    );


    return;

  }


  /* AJUDA */

  if (
    comando === "ajuda" ||
    comando.includes(
      "o que posso falar"
    )
  ) {

    falarAssistente(
      mensagemAjudaPagina()
    );

    return;

  }


  /* REPETIR */

  if (
    comando === "repetir" ||
    comando.includes(
      "repita"
    )
  ) {

    falarAssistente(
      ultimaFalaAssistente
    );

    return;

  }


  /* BUSCAR PRODUTO */

  const busca =
    textoOriginal.match(
      /^(buscar|pesquisar|procurar)\s+(.+)/i
    );


  if (busca) {

    const termo =
      busca[2].trim();


    buscarProdutoPorVoz(
      termo
    );

    return;

  }


  /* PRÓXIMO PRODUTO */

  if (
    comando.includes(
      "proximo produto"
    ) ||
    comando === "proximo"
  ) {

    proximoProduto();

    return;

  }


  /* PRODUTO ANTERIOR */

  if (
    comando.includes(
      "produto anterior"
    ) ||
    comando === "anterior"
  ) {

    produtoAnterior();

    return;

  }


  /* ABRIR PRODUTO */

  if (
    comando.includes(
      "abrir produto"
    ) ||
    comando.includes(
      "ver produto"
    )
  ) {

    abrirProdutoSelecionado();

    return;

  }


  /* TRAÇAR ROTA */

  if (
    comando.includes(
      "tracar rota"
    ) ||
    comando.includes(
      "onde encontrar"
    ) ||
    comando.includes(
      "localizar produto"
    )
  ) {

    abrirMapaProduto();

    return;

  }


  /* TOTEM */

  const totem =
    comando.match(
      /totem\s*(1|2|3|4|5)/
    );


  if (totem) {

    selecionarTotem(
      totem[1]
    );

    return;

  }


  /* OUVIR ROTA */

  if (
    comando.includes(
      "ouvir rota"
    ) ||
    comando.includes(
      "ler rota"
    ) ||
    comando.includes(
      "iniciar rota"
    )
  ) {

    lerRotaAtual();

    return;

  }


  /* RECEITA */

  if (
    comando.includes(
      "abrir receita"
    ) ||
    comando.includes(
      "ver receita"
    )
  ) {

    abrirReceita();

    return;

  }


  if (
    comando.includes(
      "ler receita"
    )
  ) {

    lerReceita();

    return;

  }


  /* FONTE */

  if (
    comando.includes(
      "aumentar fonte"
    ) ||
    comando.includes(
      "aumentar letra"
    )
  ) {

    alterarFonteVoz(
      "aumentar"
    );

    return;

  }


  if (
    comando.includes(
      "diminuir fonte"
    ) ||
    comando.includes(
      "diminuir letra"
    )
  ) {

    alterarFonteVoz(
      "diminuir"
    );

    return;

  }


  /* TEMA */

  if (
    comando.includes(
      "modo escuro"
    )
  ) {

    ativarModoEscuroVoz();

    return;

  }


  if (
    comando.includes(
      "modo claro"
    )
  ) {

    ativarModoClaroVoz();

    return;

  }


  /* CATEGORIAS */

  if (
    comando.includes(
      "listar categorias"
    ) ||
    comando.includes(
      "quais categorias"
    )
  ) {

    listarCategorias();

    return;

  }


  /* LER PÁGINA */

  if (
    comando.includes(
      "ler pagina"
    ) ||
    comando.includes(
      "onde estou"
    )
  ) {

    falarAssistente(
      mensagemInicialPagina()
    );

    return;

  }


  /* VOLTAR */

  if (
    comando === "voltar" ||
    comando.includes(
      "pagina anterior"
    )
  ) {

    pararReconhecimento();

    window.history.back();

    return;

  }


  /* INÍCIO */

  if (
    comando === "inicio" ||
    comando.includes(
      "pagina inicial"
    ) ||
    comando.includes(
      "ir para o inicio"
    )
  ) {

    pararReconhecimento();

    window.location.href =
      "index.html";

    return;

  }


  falarAssistente(
    "Não entendi o comando. Diga ajuda para ouvir as opções disponíveis."
  );

}


/* =========================
   BUSCA
========================= */

function buscarProdutoPorVoz(
  termo
) {

  const campo =
    document.getElementById(
      "campoBusca"
    );


  const botao =
    document.getElementById(
      "botaoPesquisar"
    );


  /*
    Se não estiver na página inicial,
    guarda a busca e volta.
  */

  if (
    !campo ||
    !botao
  ) {

    sessionStorage.setItem(
      "AnhanveraBuscaPendente",
      termo
    );


    falarAssistente(
      `Vou para a página inicial e buscar ${termo}.`,
      false
    );


    setTimeout(
      function () {

        window.location.href =
          "index.html";

      },
      1200
    );


    return;

  }


  campo.value =
    termo;


  campo.dispatchEvent(
    new Event(
      "input",
      {
        bubbles: true
      }
    )
  );


  botao.click();


  indiceProdutoVoz =
    -1;


  setTimeout(
    anunciarResultados,
    400
  );

}


/* =========================
   BUSCA PENDENTE
========================= */

function executarBuscaPendente() {

  const termo =
    sessionStorage.getItem(
      "AnhanveraBuscaPendente"
    );


  if (!termo) {

    return;

  }


  const campo =
    document.getElementById(
      "campoBusca"
    );


  const botao =
    document.getElementById(
      "botaoPesquisar"
    );


  if (
    !campo ||
    !botao
  ) {

    return;

  }


  sessionStorage.removeItem(
    "AnhanveraBuscaPendente"
  );


  setTimeout(
    function () {

      campo.value =
        termo;


      campo.dispatchEvent(
        new Event(
          "input",
          {
            bubbles: true
          }
        )
      );


      botao.click();


      setTimeout(
        anunciarResultados,
        500
      );

    },
    800
  );

}


/* =========================
   RESULTADOS
========================= */

function obterProdutosResultado() {

  return Array.from(
    document.querySelectorAll(
      "#resultados .card-produto"
    )
  );

}


function anunciarResultados() {

  const produtos =
    obterProdutosResultado();


  if (
    produtos.length === 0
  ) {

    falarAssistente(
      "Não encontrei produtos com esse nome. Você pode tentar outra busca."
    );

    return;

  }


  indiceProdutoVoz =
    0;


  selecionarProdutoVisualmente(
    produtos[0]
  );


  const descricao =
    descreverProdutoCard(
      produtos[0]
    );


  falarAssistente(
    `Encontrei ${produtos.length} produtos. Primeiro resultado. ${descricao}. Diga próximo produto, abrir produto ou faça uma nova busca.`
  );

}


/* =========================
   DESCREVER CARD
========================= */

function descreverProdutoCard(
  card
) {

  if (!card) {

    return "";

  }


  const nome =
    card.querySelector(
      ".nome-produto"
    )
      ?.textContent
      ?.trim() || "";


  const marca =
    card.querySelector(
      ".marca-produto"
    )
      ?.textContent
      ?.trim() || "";


  const preco =
    card.querySelector(
      ".preco"
    )
      ?.textContent
      ?.trim() || "";


  const status =
    card.querySelector(
      ".status"
    )
      ?.textContent
      ?.trim() || "";


  return [
    nome,
    marca,
    preco,
    status
  ]
    .filter(Boolean)
    .join(". ");

}


/* =========================
   PRÓXIMO
========================= */

function proximoProduto() {

  const produtos =
    obterProdutosResultado();


  if (
    produtos.length === 0
  ) {

    falarAssistente(
      "Não há resultados de produtos nesta página."
    );

    return;

  }


  indiceProdutoVoz++;


  if (
    indiceProdutoVoz >=
    produtos.length
  ) {

    indiceProdutoVoz =
      0;

  }


  const card =
    produtos[
      indiceProdutoVoz
    ];


  selecionarProdutoVisualmente(
    card
  );


  falarAssistente(
    `Produto ${indiceProdutoVoz + 1} de ${produtos.length}. ${descreverProdutoCard(card)}`
  );

}


/* =========================
   ANTERIOR
========================= */

function produtoAnterior() {

  const produtos =
    obterProdutosResultado();


  if (
    produtos.length === 0
  ) {

    falarAssistente(
      "Não há resultados de produtos nesta página."
    );

    return;

  }


  indiceProdutoVoz--;


  if (
    indiceProdutoVoz < 0
  ) {

    indiceProdutoVoz =
      produtos.length - 1;

  }


  const card =
    produtos[
      indiceProdutoVoz
    ];


  selecionarProdutoVisualmente(
    card
  );


  falarAssistente(
    `Produto ${indiceProdutoVoz + 1} de ${produtos.length}. ${descreverProdutoCard(card)}`
  );

}


/* =========================
   DESTAQUE VISUAL
========================= */

function selecionarProdutoVisualmente(
  card
) {

  document
    .querySelectorAll(
      ".resultado-voz-ativo"
    )
    .forEach(
      function (item) {

        item.classList.remove(
          "resultado-voz-ativo"
        );

      }
    );


  card.classList.add(
    "resultado-voz-ativo"
  );


  card.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =========================
   ABRIR PRODUTO
========================= */

function abrirProdutoSelecionado() {

  const produtos =
    obterProdutosResultado();


  if (
    produtos.length === 0
  ) {

    falarAssistente(
      "Não existe um produto selecionado."
    );

    return;

  }


  if (
    indiceProdutoVoz < 0
  ) {

    indiceProdutoVoz =
      0;

  }


  const card =
    produtos[
      indiceProdutoVoz
    ];


  const link =
    card.querySelector(
      ".botao-detalhes"
    );


  if (!link) {

    falarAssistente(
      "Não consegui abrir este produto."
    );

    return;

  }


  pararReconhecimento();

  link.click();

}


/* =========================
   MAPA / ROTA
========================= */

function abrirMapaProduto() {

  const botao =
    document.querySelector(
      ".botao-mapa"
    );


  if (!botao) {

    falarAssistente(
      "A opção de localização não está disponível nesta página."
    );

    return;

  }


  falarAssistente(
    "Abrindo a localização do produto.",
    false
  );


  setTimeout(
    function () {

      botao.click();

    },
    900
  );

}


/* =========================
   TOTEM
========================= */

function selecionarTotem(
  numero
) {

  const botao =
    document.querySelector(
      `.botao-totem[data-totem="${numero}"]`
    );


  if (!botao) {

    falarAssistente(
      "A escolha de totem não está disponível nesta página."
    );

    return;

  }


  botao.click();


  setTimeout(
    function () {

      falarAssistente(
        `Totem ${numero} selecionado. A rota foi calculada. Diga ouvir rota para receber as instruções.`
      );

    },
    350
  );

}


/* =========================
   LER ROTA
========================= */

function lerRotaAtual() {

  const passos =
    Array.from(
      document.querySelectorAll(
        ".passo-rota"
      )
    );


  if (
    passos.length === 0
  ) {

    falarAssistente(
      "Nenhuma rota foi calculada. Primeiro diga em qual totem você está."
    );

    return;

  }


  const instrucoes =
    passos.map(
      function (passo) {

        const spans =
          passo.querySelectorAll(
            "span"
          );


        return spans[
          spans.length - 1
        ]
          ?.textContent
          ?.trim();

      }
    )
    .filter(Boolean);


  falarAssistente(
    instrucoes.join(
      " "
    )
  );

}


/* =========================
   RECEITA
========================= */

function abrirReceita() {

  const botao =
    document.querySelector(
      ".botao-receita"
    );


  if (!botao) {

    falarAssistente(
      "Este produto não possui uma receita disponível."
    );

    return;

  }


  falarAssistente(
    "Abrindo a receita.",
    false
  );


  setTimeout(
    function () {

      botao.click();

    },
    700
  );

}


function lerReceita() {

  const titulo =
    document.querySelector(
      ".receita-card h1"
    )
      ?.textContent
      ?.trim();


  if (!titulo) {

    falarAssistente(
      "Não existe uma receita aberta nesta página."
    );

    return;

  }


  const ingredientes =
    Array.from(
      document.querySelectorAll(
        ".lista-ingredientes li"
      )
    )
      .map(
        item =>
          item.textContent.trim()
      );


  const preparo =
    Array.from(
      document.querySelectorAll(
        ".lista-preparo li"
      )
    )
      .map(
        item =>
          item.textContent.trim()
      );


  let texto =
    `Receita: ${titulo}. `;


  if (
    ingredientes.length
  ) {

    texto +=
      "Ingredientes. " +
      ingredientes.join(
        ". "
      ) +
      ". ";

  }


  if (
    preparo.length
  ) {

    texto +=
      "Modo de preparo. ";


    preparo.forEach(
      function (
        passo,
        indice
      ) {

        texto +=
          `Passo ${indice + 1}. ${passo}. `;

      }
    );

  }


  falarAssistente(
    texto
  );

}


/* =========================
   FONTE
========================= */

function alterarFonteVoz(
  acao
) {

  const id =
    acao === "aumentar"
      ? "aumentarFonte"
      : "diminuirFonte";


  const botao =
    document.getElementById(
      id
    );


  if (!botao) {

    falarAssistente(
      "Não consegui alterar o tamanho da fonte."
    );

    return;

  }


  botao.click();


  const percentual =
    document.getElementById(
      "percentualFonte"
    )
      ?.textContent ||
      "";


  falarAssistente(
    `Tamanho da interface ${percentual}.`
  );

}


/* =========================
   TEMA
========================= */

function ativarModoEscuroVoz() {

  if (
    !document.body
      .classList
      .contains(
        "modo-escuro"
      )
  ) {

    document
      .getElementById(
        "botaoEscuro"
      )
      ?.click();

  }


  falarAssistente(
    "Modo escuro ativado."
  );

}


function ativarModoClaroVoz() {

  if (
    document.body
      .classList
      .contains(
        "modo-escuro"
      )
  ) {

    document
      .getElementById(
        "botaoEscuro"
      )
      ?.click();

  }


  falarAssistente(
    "Modo claro ativado."
  );

}


/* =========================
   CATEGORIAS
========================= */

function listarCategorias() {

  const select =
    document.getElementById(
      "categoria"
    );


  if (!select) {

    falarAssistente(
      "A lista de categorias está disponível apenas na página inicial."
    );

    return;

  }


  const categorias =
    Array.from(
      select.options
    )
      .map(
        option =>
          option.textContent.trim()
      )
      .filter(
        texto =>
          texto &&
          !texto
            .toLowerCase()
            .includes(
              "todas"
            )
      );


  if (
    categorias.length === 0
  ) {

    falarAssistente(
      "Não encontrei categorias."
    );

    return;

  }


  falarAssistente(
    "As categorias disponíveis são: " +
    categorias.join(
      ", "
    ) +
    "."
  );

}


/* =========================
   CONTEXTO DA PÁGINA
========================= */

function paginaAtual() {

  const caminho =
    window.location.pathname
      .toLowerCase();


  if (
    caminho.includes(
      "produto.html"
    )
  ) {

    return "produto";

  }


  if (
    caminho.includes(
      "mapa.html"
    )
  ) {

    return "mapa";

  }


  if (
    caminho.includes(
      "receita.html"
    )
  ) {

    return "receita";

  }


  return "inicio";

}


/* =========================
   MENSAGEM INICIAL
========================= */

function mensagemInicialPagina() {

  const pagina =
    paginaAtual();


  if (
    pagina === "inicio"
  ) {

    return (
      "Você está na página inicial do Supermercado Anhanvera. " +
      "Para procurar um produto, diga buscar seguido do nome. " +
      "Por exemplo, buscar arroz. " +
      "Você também pode dizer listar categorias ou ajuda."
    );

  }


  if (
    pagina === "produto"
  ) {

    const nome =
      document.querySelector(
        ".produto-detalhe-topo h1"
      )
        ?.textContent
        ?.trim() ||
        "produto";


    const marca =
      document.querySelector(
        ".produto-marca"
      )
        ?.textContent
        ?.trim() ||
        "";


    const preco =
      document.querySelector(
        ".produto-detalhe-preco"
      )
        ?.textContent
        ?.trim() ||
        "";


    return (
      `Você está nos detalhes de ${nome}. ` +
      `${marca}. ${preco}. ` +
      "Você pode dizer onde encontrar, abrir receita, voltar, página inicial ou ajuda."
    );

  }


  if (
    pagina === "mapa"
  ) {

    const nome =
      document.querySelector(
        ".mapa-produto-info h1"
      )
        ?.textContent
        ?.trim() ||
        "o produto";


    return (
      `Você está na localização de ${nome}. ` +
      "Diga em qual totem você está. " +
      "Por exemplo, Totem 1. " +
      "Depois diga ouvir rota."
    );

  }


  if (
    pagina === "receita"
  ) {

    const receita =
      document.querySelector(
        ".receita-card h1"
      )
        ?.textContent
        ?.trim() ||
        "";


    return (
      `Você está na página da receita ${receita}. ` +
      "Diga ler receita, voltar, página inicial ou ajuda."
    );

  }


  return (
    "Diga ajuda para ouvir os comandos disponíveis."
  );

}


/* =========================
   AJUDA
========================= */

function mensagemAjudaPagina() {

  const pagina =
    paginaAtual();


  if (
    pagina === "inicio"
  ) {

    return (
      "Você pode dizer: buscar arroz, próximo produto, produto anterior, abrir produto, listar categorias, aumentar fonte, diminuir fonte, modo escuro, modo claro, repetir ou desativar voz."
    );

  }


  if (
    pagina === "produto"
  ) {

    return (
      "Você pode dizer: onde encontrar, abrir receita, aumentar fonte, diminuir fonte, modo escuro, voltar, página inicial, repetir ou desativar voz."
    );

  }


  if (
    pagina === "mapa"
  ) {

    return (
      "Você pode dizer Totem 1, Totem 2, Totem 3, Totem 4 ou Totem 5. Depois diga ouvir rota. Você também pode dizer voltar, página inicial, repetir ou desativar voz."
    );

  }


  if (
    pagina === "receita"
  ) {

    return (
      "Você pode dizer: ler receita, voltar, página inicial, repetir ou desativar voz."
    );

  }


  return (
    "Diga voltar, página inicial ou desativar voz."
  );

}


/* =========================
   BOTÃO
========================= */

function atualizarBotaoAssistente() {

  const botao =
    document.getElementById(
      "botaoAssistenteVoz"
    );


  if (!botao) {

    return;

  }


  botao.classList.toggle(
    "ativo",
    modoVozAtivo
  );


  botao.setAttribute(
    "aria-pressed",
    modoVozAtivo
  );


  botao.setAttribute(
    "aria-label",
    modoVozAtivo
      ? "Desativar navegação guiada por voz"
      : "Ativar navegação guiada por voz"
  );

}


/* =========================
   ESTADO DO MICROFONE
========================= */

function atualizarEstadoMicrofone(
  ouvindo
) {

  const botao =
    document.getElementById(
      "botaoAssistenteVoz"
    );


  if (!botao) {

    return;

  }


  botao.classList.toggle(
    "ouvindo",
    ouvindo
  );

}


/* =========================
   ATIVIDADE
========================= */

function registrarAtividadeVoz() {

  document.dispatchEvent(
    new Event(
      "atividadeVoz"
    )
  );

}