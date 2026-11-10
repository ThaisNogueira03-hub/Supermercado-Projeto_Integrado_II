document.addEventListener(
  "DOMContentLoaded",
  carregarProduto
);


async function carregarProduto() {

  try {

    const parametros =
      new URLSearchParams(
        window.location.search
      );


    const id =
      parametros.get("id");


    if (!id) {

      mostrarErro(
        "Produto não informado."
      );

      return;

    }


    const resposta =
      await fetch(
        "data/produtos.json"
      );


    if (!resposta.ok) {

      throw new Error(
        "Erro ao carregar a base."
      );

    }


    const produtos =
      await resposta.json();


    const produto =
      produtos.find(
        function(item) {

          return String(item.id) ===
            String(id);

        }
      );


    if (!produto) {

      mostrarErro(
        "Produto não encontrado."
      );

      return;

    }


    mostrarProduto(
      produto
    );

  }

  catch (erro) {

    console.error(erro);

    mostrarErro(
      "Não foi possível carregar o produto."
    );

  }

}


/* =========================
   MOSTRA O PRODUTO
========================= */

function mostrarProduto(produto) {

  const area =
    document.getElementById(
      "detalhesProduto"
    );


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


  area.innerHTML = `

    <div class="produto-detalhe-card">


      <div class="produto-detalhe-topo">


        <div>

          <div class="produto-categoria">
            ${produto.categoria}
          </div>


          <h1>
            ${produto.produto}
          </h1>


          <div class="produto-marca">
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


      <div class="produto-detalhe-preco">

        ${preco}

      </div>


      <p class="produto-detalhe-descricao">

        ${produto.descricao}

      </p>


      ${
        disponivel
          ? criarLocalizacao(produto)
          : criarIndisponivel()
      }


      ${
        produto.receita_id
          ? criarBotaoReceita(produto)
          : ""
      }


    </div>

  `;

}


/* =========================
   LOCALIZAÇÃO
========================= */

function criarLocalizacao(produto) {

  return `

    <div class="produto-localizacao">

      <h2>
        Onde encontrar
      </h2>


      <div class="produto-localizacao-grid">


        <div class="localizacao-item">

          <span>
            Corredor
          </span>

          <strong>
            ${produto.corredor}
          </strong>

        </div>


        <div class="localizacao-item">

          <span>
            Seção
          </span>

          <strong>
            ${produto.secao}
          </strong>

        </div>


        <div class="localizacao-item">

          <span>
            Prateleira
          </span>

          <strong>
            ${produto.prateleira}
          </strong>

        </div>


      </div>


      <a
        class="botao-mapa"
        href="mapa.html?produto=${produto.id}"
      >

        Ver localização no mapa

      </a>


    </div>

  `;

}


/* =========================
   INDISPONÍVEL
========================= */

function criarIndisponivel() {

  return `

    <div class="produto-indisponivel">

      Este produto está
      indisponível no momento.

    </div>

  `;

}


/* =========================
   RECEITA
========================= */

function criarBotaoReceita(produto) {

  return `

    <div class="area-receita-produto">

      <h2>
        Que tal preparar algo?
      </h2>


      <p>
        Este produto possui
        uma sugestão de receita.
      </p>


      <a
        class="botao-receita"
        href="receita.html?id=${produto.receita_id}"
      >

        Ver receita

      </a>

    </div>

  `;

}


/* =========================
   ERRO
========================= */

function mostrarErro(mensagem) {

  document
    .getElementById(
      "detalhesProduto"
    )
    .innerHTML = `

      <div class="mensagem">

        ${mensagem}

      </div>

    `;

}