let produtos = [];


document.addEventListener(
  "DOMContentLoaded",
  iniciar
);


async function iniciar() {

  try {

    const resposta =
      await fetch(
        "./data/produtos.json"
      );


    if (!resposta.ok) {

      throw new Error(
        "Não foi possível carregar os produtos."
      );

    }


    produtos =
      await resposta.json();


    carregarCategorias();

    configurarEventos();

    iniciarMapaExploracao();

    iniciarPesquisaPorVoz();


    console.log(
      `${produtos.length} produtos carregados.`
    );

  }

  catch (erro) {

    console.error(erro);


    const area =
      document.getElementById(
        "resultados"
      );


    if (area) {

      area.innerHTML = `

        <div class="mensagem">

          Não foi possível carregar
          a base de produtos.

        </div>

      `;

    }

  }

}


function configurarEventos() {

  const botao =
    document.getElementById(
      "botaoPesquisar"
    );


  const campo =
    document.getElementById(
      "campoBusca"
    );


  const categoria =
    document.getElementById(
      "categoria"
    );


  const sugestoes =
    document.getElementById(
      "sugestoesBusca"
    );


  if (botao) {

    botao.addEventListener(
      "click",
      function() {

        fecharSugestoes();

        pesquisar();

      }
    );

  }


  if (campo) {


    campo.addEventListener(
      "input",
      function() {

        mostrarSugestoes(
          campo.value
        );

      }
    );



    campo.addEventListener(
      "keydown",
      function(evento) {

        if (
          evento.key === "Enter"
        ) {

          fecharSugestoes();

          pesquisar();

        }

      }
    );

  }


  if (categoria) {

    categoria.addEventListener(
      "change",
      function() {

        if (campo) {

          campo.value = "";

        }


        fecharSugestoes();

        pesquisar();

      }
    );

  }


  /*
    Fecha sugestões
    clicando fora da pesquisa.
  */

  document.addEventListener(
    "click",
    function(evento) {

      const areaBusca =
        document.querySelector(
          ".area-busca"
        );


      if (
        areaBusca &&
        !areaBusca.contains(
          evento.target
        )
      ) {

        fecharSugestoes();

      }

    }
  );

}


/* =========================
   AUTOCOMPLETE
========================= */

function mostrarSugestoes(
  texto
) {

  const area =
    document.getElementById(
      "sugestoesBusca"
    );


  if (!area) return;


  const termo =
    normalizarTexto(
      texto
    );


  /*
    Só começa a pesquisar
    com 2 caracteres.
  */

  if (
    termo.length < 2
  ) {

    fecharSugestoes();

    return;

  }


  const encontrados =
    produtos
      .filter(
        function(produto) {

          const nome =
            normalizarTexto(
              produto.produto
            );


          const marca =
            normalizarTexto(
              produto.marca
            );


          const descricao =
            normalizarTexto(
              produto.descricao
            );


          return (

            nome.includes(termo) ||

            marca.includes(termo) ||

            descricao.includes(termo)

          );

        }
      )
      .slice(
        0,
        8
      );


  if (
    encontrados.length === 0
  ) {

    area.innerHTML = `

      <div class="sugestao-vazia">

        Nenhum produto encontrado.

      </div>

    `;


    area.classList.add(
      "visivel"
    );


    return;

  }


  area.innerHTML =
    encontrados
      .map(
        function(produto) {


          const preco =
            Number(
              produto.preco
            )
              .toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL"
                }
              );


          return `

            <button
              type="button"
              class="item-sugestao"
              data-id="${produto.id}"
            >

              <div class="sugestao-dados">

                <strong>
                  ${produto.produto}
                </strong>

                <span>
                  ${produto.marca}
                </span>

              </div>


              <span class="sugestao-preco">

                ${preco}

              </span>

            </button>

          `;

        }
      )
      .join("");


  area.classList.add(
    "visivel"
  );


  const itens =
    area.querySelectorAll(
      ".item-sugestao"
    );


  itens.forEach(
    function(item) {

      item.addEventListener(
        "click",
        function() {

          const id =
            item.dataset.id;


          window.location.href =
            `produto.html?id=${id}`;

        }
      );

    }
  );

}


/* =========================
   FECHA AUTOCOMPLETE
========================= */

function fecharSugestoes() {

  const area =
    document.getElementById(
      "sugestoesBusca"
    );


  if (!area) return;


  area.classList.remove(
    "visivel"
  );


  area.innerHTML = "";

}


/* =========================
   CATEGORIAS
========================= */

function carregarCategorias() {

  const select =
    document.getElementById(
      "categoria"
    );


  if (!select) return;


  const categorias =
    produtos
      .map(
        function(produto) {

          return produto.categoria;

        }
      )
      .filter(Boolean);


  const categoriasUnicas =
    [...new Set(categorias)];


  categoriasUnicas.sort(
    function(a, b) {

      return a.localeCompare(
        b,
        "pt-BR"
      );

    }
  );


  categoriasUnicas.forEach(
    function(categoria) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        categoria;


      option.textContent =
        categoria;


      select.appendChild(
        option
      );

    }
  );

}


/* =========================
   NORMALIZA TEXTO
========================= */

function normalizarTexto(
  texto
) {

  return String(
    texto || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

}


function pesquisar() {

  const termo =
    normalizarTexto(
      document
        .getElementById("campoBusca")
        .value
    );


  const categoriaSelecionada =
    normalizarTexto(
      document
        .getElementById("categoria")
        .value
    );


  const areaPrincipal =
    document.querySelector(
      ".home-grid-principal"
    );


  /*
    Se não houver pesquisa nem categoria,
    volta para a tela inicial com o mapa.
  */

  if (
    termo === "" &&
    categoriaSelecionada === ""
  ) {

    document
      .getElementById("resultados")
      .innerHTML = `

        <div class="mensagem-inicial">

          Pesquise um produto
          ou selecione um setor no mapa
          para começar.

        </div>

      `;


    /*
      Mostra novamente:
      mapa + escolha do totem.
    */

    if (areaPrincipal) {

      areaPrincipal.style.display =
        "grid";

    }


    return;

  }


  /*
    A partir do momento que existe
    uma pesquisa, esconde mapa,
    totem e card de ajuda.
  */

  if (areaPrincipal) {

    areaPrincipal.style.display =
      "none";

  }


  /*
    Filtra os produtos.
  */

  const resultados =
    produtos.filter(
      function (produto) {

        const nome =
          normalizarTexto(
            produto.produto
          );


        const marca =
          normalizarTexto(
            produto.marca
          );


        const descricao =
          normalizarTexto(
            produto.descricao
          );


        const categoria =
          normalizarTexto(
            produto.categoria
          );


        const correspondePesquisa =

          termo === "" ||

          nome.includes(termo) ||

          marca.includes(termo) ||

          descricao.includes(termo);


        const correspondeCategoria =

          categoriaSelecionada === "" ||

          categoria ===
          categoriaSelecionada;


        return (
          correspondePesquisa &&
          correspondeCategoria
        );

      }
    );


  mostrarResultados(
    resultados
  );


  const areaResultados =
    document.getElementById(
      "resultados"
    );


  if (areaResultados) {

    areaResultados.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


function mostrarResultados(
  resultados
) {

  const area =
    document.getElementById(
      "resultados"
    );


  if (!area) return;


  if (
    resultados.length === 0
  ) {

    area.innerHTML = `

      <div class="mensagem">

        Produto não encontrado.

        <br><br>

        Tente pesquisar
        outro nome ou marca.

      </div>

    `;


    return;

  }


  let html = `

    <div class="titulo-resultados">

      ${resultados.length}

      ${
        resultados.length === 1
          ? "produto encontrado"
          : "produtos encontrados"
      }

    </div>


    <div class="lista-produtos">

  `;


  resultados.forEach(
    function(produto) {


      const preco =
        Number(
          produto.preco
        )
          .toLocaleString(
            "pt-BR",
            {
              style: "currency",
              currency: "BRL"
            }
          );


      const disponivel =
        produto.disponibilidade;


      html += `

        <article class="card-produto">

          <div class="card-topo">

            <div>

              <div class="nome-produto">

                ${produto.produto}

              </div>


              <div class="marca-produto">

                ${produto.marca}

              </div>

            </div>


            <span
              class="
                status
                ${
                  disponivel
                    ? "status-disponivel"
                    : "status-indisponivel"
                }
              "
            >

              ${
                disponivel
                  ? "● Disponível"
                  : "● Indisponível"
              }

            </span>

          </div>


          <div class="preco">

            ${preco}

          </div>


          <div class="descricao-produto">

            ${produto.descricao}

          </div>


          <div class="localizacao-resumo">

            <strong>
              Seção:
            </strong>

            ${produto.secao}

          </div>


          <a
            class="botao-detalhes"
            href="produto.html?id=${produto.id}"
          >

            Ver detalhes →

          </a>

        </article>

      `;

    }
  );


  html += `

    </div>

  `;


  area.innerHTML =
    html;

}


/* =========================
   SETORES DO MAPA
========================= */

const setoresMapa = {

  "graos-basicos": {

    titulo:
      "Grãos e Básicos",

    secoes: [
      "Grãos",
      "Açucar",
      "Sal",
      "Óleos e Azeites"
    ]

  },


  "farinhas-massas": {

    titulo:
      "Farinhas e Massas",

    secoes: [
      "Farinhas",
      "Massas"
    ]

  },


  "cafe-achocolatados": {

    titulo:
      "Café e Achocolatados",

    secoes: [
      "Café e Achocolatados"
    ]

  },


  "aveia": {

    titulo:
      "Aveia",

    secoes: [
      "Aveia"
    ]

  },


  "molhos-conservas": {

    titulo:
      "Molhos e Conservas",

    secoes: [
      "Molhos e conservas"
    ]

  },


  "temperos": {

    titulo:
      "Temperos",

    secoes: [
      "Temperos"
    ]

  },


  "hortifruti-frutas": {

    titulo:
      "Hortifruti - Frutas",

    categorias: [
      "Frutas"
    ]

  },


  "hortifruti-verduras": {

    titulo:
      "Hortifruti - Verduras",

    categorias: [
      "Verduras e legumes"
    ]

  },


  "aguas": {

    titulo:
      "Águas",

    secoes: [
      "Águas"
    ]

  },


  "energeticos": {

    titulo:
      "Energéticos",

    secoes: [
      "Energéticos"
    ]

  },


  "refrigerantes": {

    titulo:
      "Refrigerantes",

    secoes: [
      "Refrigerantes"
    ]

  },


  "sucos": {

    titulo:
      "Sucos",

    secoes: [
      "Sucos"
    ]

  },


  "batatas-salgadinhos": {

    titulo:
      "Batatas e Salgadinhos",

    secoes: [
      "Batatas e Salgadinhos"
    ]

  },


  "doces": {

    titulo:
      "Doces",

    secoes: [
      "Doces"
    ]

  },


  "paes-biscoitos": {

    titulo:
      "Pães e Biscoitos",

    secoes: [
      "Pães e Biscoitos"
    ]

  },


  "ovos": {

    titulo:
      "Ovos",

    secoes: [
      "Ovos"
    ]

  },


  "leites": {

    titulo:
      "Leites",

    secoes: [
      "Leites"
    ]

  },


  "laticinios-refrigerados": {

    titulo:
      "Laticínios Refrigerados",

    secoes: [
      "Laticínios refrigerados"
    ]

  },


  "confeitaria": {

    titulo:
      "Confeitaria",

    secoes: [
      "Confeitaria"
    ]

  },


  "congelados": {

    titulo:
      "Congelados",

    secoes: [
      "Congelados"
    ]

  },


  "peixes": {

    titulo:
      "Peixes",

    secoes: [
      "Peixes"
    ]

  },


  "aves-embutidos": {

    titulo:
      "Aves e Embutidos",

    secoes: [
      "Aves e embutidos"
    ]

  },


  "acougue": {

    titulo:
      "Açougue",

    secoes: [
      "Açougue"
    ]

  },


  "higiene-pessoal": {

    titulo:
      "Higiene Pessoal",

    secoes: [
      "Higiene pessoal"
    ]

  },


  "beleza": {

    titulo:
      "Beleza",

    secoes: [
      "Beleza"
    ]

  },


  "utensilios-limpeza": {

    titulo:
      "Utensílios de Limpeza",

    secoes: [
      "Utensílios de limpeza",
      "Utilidades domésticas"
    ]

  },


  "produtos-limpeza": {

    titulo:
      "Produtos de Limpeza",

    secoes: [
      "Produtos de limpeza"
    ]

  }

};


/* =========================
   CARREGA MAPA
========================= */

async function iniciarMapaExploracao() {

  const area =
    document.getElementById(
      "mapaExploracao"
    );


  if (!area) return;


  try {

    const resposta =
      await fetch(
        "./assets/mapa/supermercado-anhanvera.svg"
      );


    if (!resposta.ok) {

      throw new Error(
        "Erro ao carregar mapa."
      );

    }


    const svg =
      await resposta.text();


    area.innerHTML =
      svg;


    configurarMapaClicavel();

  }

  catch (erro) {

    console.error(erro);


    area.innerHTML = `

      <div class="mensagem">

        Não foi possível carregar
        o mapa do supermercado.

      </div>

    `;

  }

}


/* =========================
   MAPA CLICÁVEL
========================= */

function configurarMapaClicavel() {

  const area =
    document.getElementById(
      "mapaExploracao"
    );


  if (!area) return;


  const setores =
    area.querySelectorAll(
      ".sector-hotspot"
    );


  setores.forEach(
    function(setor) {

      setor.addEventListener(
        "click",
        function() {

          selecionarSetor(
            setor,
            area
          );

        }
      );

    }
  );

}


/* =========================
   SELECIONA SETOR
========================= */

function selecionarSetor(
  setor,
  area
) {

  const idSetor =
    setor.dataset.setor;


  const corredor =
    setor.dataset.corredor;


  const configuracao =
    setoresMapa[idSetor];


  if (!configuracao) {

    console.warn(
      "Setor sem configuração:",
      idSetor
    );

    return;

  }


  area
    .querySelectorAll(
      ".sector-hotspot"
    )
    .forEach(
      function(elemento) {

        elemento.classList.remove(
          "destino"
        );

      }
    );


  setor.classList.add(
    "destino"
  );


  const encontrados =
    filtrarProdutosPorSetor(
      configuracao
    );


  mostrarProdutosDoSetor(
    encontrados,
    corredor,
    configuracao.titulo
  );

}


/* =========================
   FILTRA SETOR
========================= */

function filtrarProdutosPorSetor(
  configuracao
) {

  return produtos.filter(
    function(produto) {


      const secao =
        normalizarTexto(
          produto.secao
        );


      const categoria =
        normalizarTexto(
          produto.categoria
        );


      let correspondeSecao =
        false;


      let correspondeCategoria =
        false;


      if (
        configuracao.secoes
      ) {

        correspondeSecao =
          configuracao.secoes.some(
            function(item) {

              return (
                normalizarTexto(item) ===
                secao
              );

            }
          );

      }


      if (
        configuracao.categorias
      ) {

        correspondeCategoria =
          configuracao.categorias.some(
            function(item) {

              return (
                normalizarTexto(item) ===
                categoria
              );

            }
          );

      }


      return (
        correspondeSecao ||
        correspondeCategoria
      );

    }
  );

}


/* =========================
   RESULTADOS DO SETOR
========================= */

function mostrarProdutosDoSetor(
  encontrados,
  corredor,
  titulo
) {

  const area =
    document.getElementById(
      "produtosSetor"
    );


  if (!area) return;


  if (
    encontrados.length === 0
  ) {

    area.innerHTML = `

      <div class="produtos-setor-cabecalho">

        <span>
          Corredor ${corredor}
        </span>

        <h3>
          ${titulo}
        </h3>

      </div>


      <div class="mensagem">

        Nenhum produto cadastrado
        neste setor.

      </div>

    `;


    return;

  }


  let cards = "";


  encontrados.forEach(
    function(produto) {


      const preco =
        Number(
          produto.preco
        )
          .toLocaleString(
            "pt-BR",
            {
              style: "currency",
              currency: "BRL"
            }
          );


      cards += `

        <article class="card-produto">

          <div class="card-topo">

            <div>

              <div class="nome-produto">

                ${produto.produto}

              </div>


              <div class="marca-produto">

                ${produto.marca}

              </div>

            </div>


            <span
              class="
                status
                ${
                  produto.disponibilidade
                    ? "status-disponivel"
                    : "status-indisponivel"
                }
              "
            >

              ${
                produto.disponibilidade
                  ? "● Disponível"
                  : "● Indisponível"
              }

            </span>

          </div>


          <div class="preco">

            ${preco}

          </div>


          <div class="descricao-produto">

            ${produto.descricao}

          </div>


          <a
            class="botao-detalhes"
            href="produto.html?id=${produto.id}"
          >

            Ver detalhes →

          </a>

        </article>

      `;

    }
  );


  area.innerHTML = `

    <div class="produtos-setor-cabecalho">

      <span>

        Corredor ${corredor}

      </span>


      <h3>

        ${titulo}

      </h3>


      <p>

        ${encontrados.length}

        ${
          encontrados.length === 1
            ? "produto encontrado"
            : "produtos encontrados"
        }

      </p>

    </div>


    <div class="lista-produtos">

      ${cards}

    </div>

  `;


  area.scrollIntoView(
    {
      behavior: "smooth",
      block: "start"
    }
  );

}

/* =========================
   PESQUISA POR VOZ
========================= */

function iniciarPesquisaPorVoz() {

  const botao =
    document.getElementById(
      "botaoVozBusca"
    );


  const campo =
    document.getElementById(
      "campoBusca"
    );


  if (
    !botao ||
    !campo
  ) {

    return;

  }


  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (
    !SpeechRecognition
  ) {

    botao.disabled = true;

    botao.title =
      "Pesquisa por voz não disponível neste navegador.";

    return;

  }


  const reconhecimento =
    new SpeechRecognition();


  reconhecimento.lang =
    "pt-BR";


  reconhecimento.interimResults =
    false;


  reconhecimento.continuous =
    false;


  reconhecimento.maxAlternatives =
    1;


  botao.addEventListener(
    "click",
    function() {

      try {

        reconhecimento.start();

      }

      catch (erro) {

        console.log(
          "Reconhecimento de voz já ativo."
        );

      }

    }
  );


  reconhecimento.onstart =
    function() {

      botao.classList.add(
        "ouvindo"
      );


      botao.setAttribute(
        "aria-label",
        "Ouvindo"
      );


      campo.placeholder =
        "Ouvindo... fale o nome do produto";

    };


  reconhecimento.onresult =
    function(evento) {

      const texto =
        evento.results[0][0]
          .transcript
          .trim();


      campo.value =
        texto;


      mostrarSugestoes(
        texto
      );


      pesquisar();

    };


  reconhecimento.onerror =
    function(erro) {

      console.error(
        "Erro na pesquisa por voz:",
        erro.error
      );


      if (
        erro.error ===
        "not-allowed"
      ) {

        alert(
          "É necessário permitir o uso do microfone para pesquisar por voz."
        );

      }

    };


  reconhecimento.onend =
    function() {

      botao.classList.remove(
        "ouvindo"
      );


      botao.setAttribute(
        "aria-label",
        "Pesquisar por voz"
      );


      campo.placeholder =
        "Ex.: arroz, café, Camil...";

    };

}

