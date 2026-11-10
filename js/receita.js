document.addEventListener(
  "DOMContentLoaded",
  carregarReceita
);


async function carregarReceita() {

  try {

    const parametros =
      new URLSearchParams(
        window.location.search
      );


    const id =
      parametros.get("id");


    if (!id) {

      mostrarErroReceita(
        "Receita não informada."
      );

      return;

    }


    const resposta =
      await fetch(
        "data/receitas.json"
      );


    if (!resposta.ok) {

      throw new Error(
        "Erro ao carregar receitas."
      );

    }


    const receitas =
      await resposta.json();


    const receita =
      receitas.find(
        function(item) {

          return String(item.id) ===
            String(id);

        }
      );


    if (!receita) {

      mostrarErroReceita(
        "Receita não encontrada."
      );

      return;

    }


    mostrarReceita(
      receita
    );

  }

  catch (erro) {

    console.error(erro);


    mostrarErroReceita(
      "Não foi possível carregar a receita."
    );

  }

}


/* =========================
   MOSTRA A RECEITA
========================= */

function mostrarReceita(receita) {

  const area =
    document.getElementById(
      "detalhesReceita"
    );


  const ingredientes =
    receita.ingredientes
      .map(
        ingrediente => `
          <li>${ingrediente}</li>
        `
      )
      .join("");


  const preparo =
    receita.modo_preparo
      .map(
        (etapa, indice) => `
          <li>
            <strong>
              ${indice + 1}.
            </strong>

            ${etapa}
          </li>
        `
      )
      .join("");


  area.innerHTML = `

    <article class="receita-card">


      <div class="receita-topo">

        <div>

          <span class="receita-etiqueta">
            Sugestão de receita
          </span>

          <h1>
            ${receita.nome}
          </h1>

          <p class="receita-descricao">
          ${receita.descricao}
        </p>

        </div>

        </div>


        <div class="receita-imagem-wrapper">

          <img
          src="assets/receitas/${receita.id}.png"
          alt="${receita.nome}"
          class="receita-imagem"
        >

        </div>


        <div class="receita-resumo">

        <div class="receita-info">

          <span>
            Tempo
          </span>

          <strong>
            ${receita.tempo}
          </strong>

        </div>


        <div class="receita-info">

          <span>
            Rendimento
          </span>

          <strong>
            ${receita.rendimento}
          </strong>

        </div>

      </div>


      <div class="receita-conteudo">


        <section>

          <h2>
            Ingredientes
          </h2>

          <ul class="lista-ingredientes">

            ${ingredientes}

          </ul>

        </section>


        <section>

          <h2>
            Modo de preparo
          </h2>

          <ol class="lista-preparo">

            ${preparo}

          </ol>

        </section>


      </div>


    </article>

  `;

}


/* =========================
   ERRO
========================= */

function mostrarErroReceita(mensagem) {

  document
    .getElementById(
      "detalhesReceita"
    )
    .innerHTML = `

      <div class="mensagem">

        ${mensagem}

      </div>

    `;

}