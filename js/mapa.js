document.addEventListener(
  "DOMContentLoaded",
  carregarMapa
);


/* =========================
   CARREGAMENTO PRINCIPAL
========================= */

async function carregarMapa() {

  try {

    const parametros =
      new URLSearchParams(
        window.location.search
      );

    const idProduto =
      parametros.get("produto");


    if (!idProduto) {

      mostrarErroMapa(
        "Produto não informado."
      );

      return;
    }


    const resposta =
      await fetch(
        "./data/produtos.json"
      );


    if (!resposta.ok) {

      throw new Error(
        "Erro ao carregar produtos."
      );
    }


    const produtos =
      await resposta.json();


    const produto =
      produtos.find(
        function(item) {

          return String(item.id) ===
            String(idProduto);

        }
      );


    if (!produto) {

      mostrarErroMapa(
        "Produto não encontrado."
      );

      return;
    }


    mostrarInformacoes(
      produto
    );


    await carregarSvgMapa(
      produto
    );

  }

  catch (erro) {

    console.error(erro);

    mostrarErroMapa(
      "Não foi possível carregar o mapa."
    );
  }

}


/* =========================
   INFORMAÇÕES DO PRODUTO
========================= */

function mostrarInformacoes(produto) {

  const area =
    document.getElementById(
      "informacoesMapa"
    );


  if (!area) return;


  area.innerHTML = `

    <div class="mapa-produto-info">

      <div>

        <span class="mapa-etiqueta">
          Localização do produto
        </span>

        <h1>
          ${produto.produto}
        </h1>

        <p>
          ${produto.marca}
        </p>

      </div>


      <div class="mapa-localizacao-resumo">

        <div>

          <span>
            Corredor
          </span>

          <strong>
            ${produto.corredor}
          </strong>

        </div>


        <div>

          <span>
            Seção
          </span>

          <strong>
            ${produto.secao}
          </strong>

        </div>


        <div>

          <span>
            Prateleira
          </span>

          <strong>
            ${produto.prateleira}
          </strong>

        </div>

      </div>

    </div>

  `;
}


/* =========================
   CARREGA O SVG
========================= */

async function carregarSvgMapa(produto) {

  const area =
    document.getElementById(
      "mapaProduto"
    );


  if (!area) {

    console.error(
      "Área mapaProduto não encontrada."
    );

    return;
  }


  const resposta =
    await fetch(
      "./assets/mapa/supermercado-anhanvera.svg"
    );


  if (!resposta.ok) {

    throw new Error(
      "Não foi possível carregar o SVG."
    );
  }


  const svgTexto =
    await resposta.text();


  area.innerHTML =
    svgTexto;


  const svg =
    area.querySelector("svg");


  if (!svg) {

    throw new Error(
      "SVG não encontrado."
    );
  }


  svg.classList.add(
    "modo-rota"
  );


  configurarModoLocalizacao(
    svg
  );


  destacarSetorProduto(
    produto,
    area
  );


  configurarTotens(
    produto,
    area
  );
}


/* =========================
   MODO LOCALIZAÇÃO
========================= */

function configurarModoLocalizacao(svg) {

  const estilo =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );


  estilo.textContent = `

    /* outros setores não clicam */

    .modo-rota .sector-hotspot,
    .modo-rota .sector-hit {

      pointer-events: none !important;
      cursor: default !important;

    }


    /* tira o efeito de botão */

    .modo-rota
    .sector-card-copy {

      transform: none !important;
      filter: none !important;

    }


    .modo-rota
    .sector-hover-tint {

      fill: transparent !important;
      stroke: transparent !important;

    }


    /* setor do produto */

    .modo-rota
    .sector-hotspot.destino
    .sector-hover-tint {

      fill:
        rgba(22, 101, 52, 0.32)
        !important;

      stroke:
        #14532d
        !important;

      stroke-width:
        4
        !important;

    }


    /* rotas escondidas inicialmente */

    .modo-rota
    .tactile-edge {

      stroke: transparent !important;

    }


    .modo-rota
    .route-edge {

      stroke: transparent !important;

    }

  `;


  svg.appendChild(
    estilo
  );


  const setores =
    svg.querySelectorAll(
      ".sector-hotspot"
    );


  setores.forEach(
    function(setor) {

      setor.removeAttribute(
        "tabindex"
      );

      setor.setAttribute(
        "aria-disabled",
        "true"
      );
    }
  );
}


/* =========================
   DESCOBRE O SETOR
========================= */

function obterSetorProduto(produto) {

  const secao =
    normalizarTexto(
      produto.secao
    );


  const categoria =
    normalizarTexto(
      produto.categoria
    );


  const mapaSecoes = {

    "graos":
      "graos-basicos",

    "acucar":
      "graos-basicos",

    "sal":
      "graos-basicos",

    "oleos e azeites":
      "graos-basicos",


    "farinhas":
      "farinhas-massas",

    "massas":
      "farinhas-massas",


    "cafe e achocolatados":
      "cafe-achocolatados",

    "aveia":
      "aveia",

    "molhos e conservas":
      "molhos-conservas",

    "temperos":
      "temperos",


    "aguas":
      "aguas",

    "energeticos":
      "energeticos",

    "refrigerantes":
      "refrigerantes",

    "sucos":
      "sucos",


    "batatas e salgadinhos":
      "batatas-salgadinhos",

    "doces":
      "doces",

    "paes e biscoitos":
      "paes-biscoitos",


    "ovos":
      "ovos",

    "leites":
      "leites",

    "laticinios refrigerados":
      "laticinios-refrigerados",

    "confeitaria":
      "confeitaria",


    "congelados":
      "congelados",


    "peixes":
      "peixes",

    "aves e embutidos":
      "aves-embutidos",

    "acougue":
      "acougue",


    "higiene pessoal":
      "higiene-pessoal",

    "beleza":
      "beleza",

    "utensilios de limpeza":
      "utensilios-limpeza",

    "utilidades domesticas":
      "utensilios-limpeza",

    "produtos de limpeza":
      "produtos-limpeza"
  };


  if (mapaSecoes[secao]) {

    return mapaSecoes[secao];
  }


  if (categoria === "frutas") {

    return "hortifruti-frutas";
  }


  if (
    categoria ===
    "verduras e legumes"
  ) {

    return "hortifruti-verduras";
  }


  return null;
}


/* =========================
   DESTACA O SETOR
========================= */

function destacarSetorProduto(
  produto,
  area
) {

  const idSetor =
    obterSetorProduto(
      produto
    );


  if (!idSetor) {

    console.warn(
      "Setor não identificado:",
      produto.secao
    );

    return;
  }


  const setor =
    area.querySelector(
      `[data-setor="${idSetor}"]`
    );


  if (!setor) {

    console.warn(
      "Setor não encontrado no SVG:",
      idSetor
    );

    return;
  }


  setor.classList.add(
    "destino"
  );
}


/* =========================
   NORMALIZA TEXTO
========================= */

function normalizarTexto(texto) {

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


/* =========================
   MALHA REAL DE CIRCULAÇÃO
========================= */

/*
  Todos estes pontos ficam
  SOBRE as linhas verdes do mapa.
*/

const pontosRota = {

  t1: { x: 219, y: 175 },
  a:  { x: 219, y: 274 },
  b:  { x: 492, y: 274 },
  u:  { x: 692, y: 274 },

  c:  { x: 219, y: 511 },
  d:  { x: 492, y: 511 },
  e:  { x: 539, y: 511 },
  f:  { x: 857, y: 511 },

  t2: { x: 857, y: 175 },

  g:  { x: 219, y: 901 },
  h:  { x: 490, y: 901 },
  i:  { x: 539, y: 901 },
  j:  { x: 857, y: 901 },
  t3: { x: 974, y: 901 },

  t5: { x: 139, y: 1011 },
  k:  { x: 219, y: 1011 },
  l:  { x: 490, y: 1011 },
  r:  { x: 997, y: 1011 },

  m:  { x: 219, y: 1139 },
  n:  { x: 558, y: 1139 },
  o:  { x: 843, y: 1139 },
  t4: { x: 976, y: 1139 },

  p: {
    x: 558,
    y: 1249
  },

  fundoEsquerda: {
    x: 558,
    y: 1390
  },

  q: {
    x: 843,
    y: 1390
  }

};


/*
  SOMENTE conexões que existem
  fisicamente no supermercado.

  Se dois pontos não aparecem aqui,
  a rota não pode atravessar entre eles.
*/

const arestasRota = [

  ["t1", "a"],

  ["a", "b"],
  ["a", "c"],

  ["b", "u"],
  ["b", "d"],

  ["t2", "f"],

  ["c", "d"],
  ["c", "g"],

  ["d", "e"],

  ["e", "f"],
  ["e", "i"],

  ["f", "j"],

  ["g", "h"],
  ["g", "k"],

  ["h", "i"],
  ["h", "l"],

  ["i", "j"],

  ["j", "t3"],

  ["t5", "k"],

  ["k", "l"],
  ["k", "m"],

  ["l", "r"],

  ["m", "n"],

  ["n", "o"],
  ["n", "p"],

  ["o", "t4"],
  ["o", "q"],

  ["p", "fundoEsquerda"]

];


/* =========================
   TOTENS
========================= */

const nosTotens = {

  1: "t1",

  2: "t2",

  3: "t3",

  4: "t4",

  5: "t5"

};


/* =========================
   ACESSO DE CADA SETOR
========================= */

/*
  acesso:
  ponto da linha verde onde
  a pessoa chega.

  fim:
  ponto onde a rota termina,
  exatamente na borda do setor.
*/

const acessosSetores = {

  "graos-basicos": {

    segmento: ["a", "b"],

    acesso: {
      x: 356,
      y: 274
    },

    fim: {
      x: 356,
      y: 236
    }

  },


  "farinhas-massas": {

    segmento: ["b", "u"],

    acesso: {
      x: 576,
      y: 274
    },

    fim: {
      x: 576,
      y: 236
    }

  },


  "cafe-achocolatados": {

    segmento: ["t2", "f"],

    acesso: {
      x: 857,
      y: 265
    },

    fim: {
      x: 827,
      y: 265
    }

  },


  "aveia": {

    segmento: ["t2", "f"],

    acesso: {
      x: 857,
      y: 418
    },

    fim: {
      x: 826,
      y: 418
    }

  },


  "molhos-conservas": {

    segmento: ["t2", "f"],

    acesso: {
      x: 857,
      y: 260
    },

    fim: {
      x: 886,
      y: 260
    }

  },


  "temperos": {

    segmento: ["t2", "f"],

    acesso: {
      x: 857,
      y: 413
    },

    fim: {
      x: 884,
      y: 413
    }

  },


  "hortifruti-verduras": {

    segmento: ["c", "d"],

    acesso: {
      x: 361,
      y: 511
    },

    fim: {
      x: 361,
      y: 483
    }

  },


  "hortifruti-frutas": {

    segmento: ["e", "f"],

    acesso: {
      x: 600,
      y: 511
    },

    fim: {
      x: 600,
      y: 483
    }

  },


  "aguas": {

    segmento: ["c", "g"],

    acesso: {
      x: 219,
      y: 632
    },

    fim: {
      x: 210,
      y: 632
    }

  },


  "energeticos": {

    segmento: ["c", "g"],

    acesso: {
      x: 219,
      y: 796
    },

    fim: {
      x: 210,
      y: 796
    }

  },


  "refrigerantes": {

    segmento: ["c", "d"],

    acesso: {
      x: 322,
      y: 511
    },

    fim: {
      x: 322,
      y: 548
    }

  },


  "batatas-salgadinhos": {

    segmento: ["c", "d"],

    acesso: {
      x: 450,
      y: 511
    },

    fim: {
      x: 450,
      y: 548
    }

  },


  "sucos": {

    segmento: ["g", "h"],

    acesso: {
      x: 322,
      y: 901
    },

    fim: {
      x: 322,
      y: 871
    }

  },


  "doces": {

    segmento: ["g", "h"],

    acesso: {
      x: 450,
      y: 901
    },

    fim: {
      x: 450,
      y: 871
    }

  },


  "paes-biscoitos": {

    segmento: ["i", "j"],

    acesso: {
      x: 639,
      y: 901
    },

    fim: {
      x: 639,
      y: 865
    }

  },


  "ovos": {

    segmento: ["f", "j"],

    acesso: {
      x: 857,
      y: 626
    },

    fim: {
      x: 820,
      y: 626
    }

  },


  "leites": {

    segmento: ["f", "j"],

    acesso: {
      x: 857,
      y: 784
    },

    fim: {
      x: 820,
      y: 784
    }

  },


  "laticinios-refrigerados": {

    segmento: ["f", "j"],

    acesso: {
      x: 857,
      y: 631
    },

    fim: {
      x: 878,
      y: 631
    }

  },


  "confeitaria": {

    segmento: ["f", "j"],

    acesso: {
      x: 857,
      y: 791
    },

    fim: {
      x: 878,
      y: 791
    }

  },


  "congelados": {

    segmento: ["i", "j"],

    acesso: {
      x: 767,
      y: 901
    },

    fim: {
      x: 767,
      y: 929
    }

  },


  "peixes": {

    segmento: ["l", "r"],

    acesso: {
      x: 434,
      y: 1011
    },

    fim: {
      x: 434,
      y: 1038
    }

  },


  "aves-embutidos": {

    segmento: ["l", "r"],

    acesso: {
      x: 654,
      y: 1011
    },

    fim: {
      x: 654,
      y: 1038
    }

  },


  "acougue": {

    segmento: ["l", "r"],

    acesso: {
      x: 884,
      y: 1011
    },

    fim: {
      x: 884,
      y: 1038
    }

  },


  "higiene-pessoal": {

    segmento: ["n", "p"],

    acesso: {
      x: 558,
      y: 1230
    },

    fim: {
      x: 594,
      y: 1230
    }

  },


  "beleza": {

    segmento: [
      "p",
      "fundoEsquerda"
    ],

    acesso: {
      x: 558,
      y: 1340
    },

    fim: {
      x: 594,
      y: 1340
    }

  },


  "utensilios-limpeza": {

    segmento: ["o", "q"],

    acesso: {
      x: 843,
      y: 1280
    },

    fim: {
      x: 821,
      y: 1280
    }

  },


  "produtos-limpeza": {

    segmento: ["o", "q"],

    acesso: {
      x: 843,
      y: 1279
    },

    fim: {
      x: 876,
      y: 1279
    }

  }

};


/* =========================
   CONFIGURA TOTENS
========================= */

function configurarTotens(
  produto,
  area
) {

  const botoes =
    document.querySelectorAll(
      ".botao-totem"
    );


  botoes.forEach(
    function(botao) {

      botao.addEventListener(
        "click",
        function() {


          botoes.forEach(
            function(outro) {

              outro.classList.remove(
                "ativo"
              );

            }
          );


          botao.classList.add(
            "ativo"
          );


          desenharRota(

            botao.dataset.totem,

            produto,

            area

          );

        }
      );

    }
  );
}


/* =========================
   DISTÂNCIA
========================= */

function distanciaEntre(
  a,
  b
) {

  return (

    Math.abs(
      a.x - b.x
    ) +

    Math.abs(
      a.y - b.y
    )

  );
}


/* =========================
   ADICIONA ARESTA
========================= */

function adicionarAresta(
  grafo,
  a,
  b,
  distancia
) {

  if (!grafo[a]) {

    grafo[a] = [];
  }


  if (!grafo[b]) {

    grafo[b] = [];
  }


  grafo[a].push(
    {
      no: b,
      distancia: distancia
    }
  );


  grafo[b].push(
    {
      no: a,
      distancia: distancia
    }
  );
}


/* =========================
   CRIA GRAFO
========================= */

function criarGrafoComDestino(
  idSetor
) {

  const acesso =
    acessosSetores[
      idSetor
    ];


  if (!acesso) {

    return null;
  }


  const grafo = {};


  Object.keys(
    pontosRota
  )
    .forEach(
      function(no) {

        grafo[no] = [];

      }
    );


  arestasRota.forEach(
    function(aresta) {

      const a =
        aresta[0];

      const b =
        aresta[1];


      adicionarAresta(

        grafo,

        a,

        b,

        distanciaEntre(
          pontosRota[a],
          pontosRota[b]
        )

      );

    }
  );


  const extremoA =
    acesso.segmento[0];


  const extremoB =
    acesso.segmento[1];


  grafo.destino = [];


  adicionarAresta(

    grafo,

    extremoA,

    "destino",

    distanciaEntre(
      pontosRota[extremoA],
      acesso.acesso
    )

  );


  adicionarAresta(

    grafo,

    extremoB,

    "destino",

    distanciaEntre(
      pontosRota[extremoB],
      acesso.acesso
    )

  );


  return {

    grafo: grafo,

    coordenadas: {

      ...pontosRota,

      destino:
        acesso.acesso

    },

    fim:
      acesso.fim

  };
}


/* =========================
   MENOR CAMINHO
========================= */

function calcularMenorCaminho(
  grafo,
  origem,
  destino
) {

  const distancias = {};

  const anterior = {};

  const visitados =
    new Set();


  Object.keys(grafo)
    .forEach(
      function(no) {

        distancias[no] =
          Infinity;

      }
    );


  distancias[origem] =
    0;


  while (true) {

    let atual =
      null;

    let menor =
      Infinity;


    Object.keys(
      distancias
    )
      .forEach(
        function(no) {

          if (
            !visitados.has(no) &&
            distancias[no] < menor
          ) {

            atual =
              no;

            menor =
              distancias[no];

          }

        }
      );


    if (
      atual === null ||
      atual === destino
    ) {

      break;
    }


    visitados.add(
      atual
    );


    const vizinhos =
      grafo[atual] || [];


    vizinhos.forEach(
      function(vizinho) {

        const nova =

          distancias[atual] +

          vizinho.distancia;


        if (
          nova <
          distancias[vizinho.no]
        ) {

          distancias[
            vizinho.no
          ] =
            nova;


          anterior[
            vizinho.no
          ] =
            atual;

        }

      }
    );
  }


  const caminho = [];

  let atual =
    destino;


  while (atual) {

    caminho.unshift(
      atual
    );


    if (
      atual === origem
    ) {

      break;
    }


    atual =
      anterior[atual];
  }


  if (
    caminho[0] !== origem
  ) {

    return [];
  }


  return caminho;
}


/* =========================
   LIMPA ROTA ANTERIOR
========================= */

function limparRota(
  area
) {

  const rota =
    area.querySelector(
      "#rotaProduto"
    );


  if (rota) {

    rota.remove();
  }


  const fim =
    area.querySelector(
      "#fimRotaProduto"
    );


  if (fim) {

    fim.remove();
  }
}


/* =========================
   DESENHA ROTA
========================= */

function desenharRota(
  numeroTotem,
  produto,
  area
) {

  limparRota(
    area
  );


  const origem =
    nosTotens[
      numeroTotem
    ];


  const idSetor =
    obterSetorProduto(
      produto
    );


  const dados =
    criarGrafoComDestino(
      idSetor
    );


  if (
    !origem ||
    !dados
  ) {

    console.warn(
      "Não foi possível calcular a rota."
    );

    return;
  }


  const caminho =
    calcularMenorCaminho(

      dados.grafo,

      origem,

      "destino"

    );


  if (
    caminho.length < 2
  ) {

    console.warn(
      "Rota não encontrada."
    );

    return;
  }


  const pontos =
    caminho.map(
      function(no) {

        return dados
          .coordenadas[
            no
          ];

      }
    );




  pontos.push(
    dados.fim
  );


  const svg =
    area.querySelector(
      "svg"
    );


  const namespace =
    "http://www.w3.org/2000/svg";


  const rota =
    document.createElementNS(
      namespace,
      "path"
    );


  let d = "";


  pontos.forEach(
    function(ponto, indice) {

      if (
        indice === 0
      ) {

        d +=
          `M ${ponto.x} ${ponto.y}`;

      }

      else {

        d +=
          ` L ${ponto.x} ${ponto.y}`;

      }

    }
  );


  rota.setAttribute(
    "id",
    "rotaProduto"
  );


  rota.setAttribute(
    "d",
    d
  );


  rota.setAttribute(
    "fill",
    "none"
  );


  rota.setAttribute(
    "stroke",
    "#f2b705"
  );


  rota.setAttribute(
    "stroke-width",
    "7"
  );


  rota.setAttribute(
    "stroke-dasharray",
    "2 11"
  );


  rota.setAttribute(
    "stroke-linecap",
    "round"
  );


  rota.setAttribute(
    "stroke-linejoin",
    "round"
  );


  rota.setAttribute(
    "pointer-events",
    "none"
  );


  svg.appendChild(
    rota
  );


  /* ponto final */

  const fim =
    pontos[
      pontos.length - 1
    ];


  const marcador =
    document.createElementNS(
      namespace,
      "circle"
    );


  marcador.setAttribute(
    "id",
    "fimRotaProduto"
  );


  marcador.setAttribute(
    "cx",
    fim.x
  );


  marcador.setAttribute(
    "cy",
    fim.y
  );


  marcador.setAttribute(
    "r",
    "6"
  );


  marcador.setAttribute(
    "fill",
    "#f2b705"
  );


  marcador.setAttribute(
    "stroke",
    "#ffffff"
  );


  marcador.setAttribute(
    "stroke-width",
    "2"
  );


  svg.appendChild(
    marcador
  );


  const instrucoes =
  gerarInstrucoesRota(

    caminho,

    dados.coordenadas,

    numeroTotem,

    produto

  );


mostrarInstrucaoRota(
  numeroTotem,
  produto,
  instrucoes
);
}

/* =========================
   DIREÇÃO ENTRE PONTOS
========================= */

function obterDirecao(
  pontoA,
  pontoB
) {

  const dx =
    pontoB.x -
    pontoA.x;


  const dy =
    pontoB.y -
    pontoA.y;


  if (
    Math.abs(dx) >
    Math.abs(dy)
  ) {

    return dx > 0
      ? "leste"
      : "oeste";

  }


  return dy > 0
    ? "sul"
    : "norte";

}


/* =========================
   TIPO DE VIRADA
========================= */

function obterVirada(
  entrada,
  saida
) {

  const direcoes = [
    "norte",
    "leste",
    "sul",
    "oeste"
  ];


  const indiceEntrada =
    direcoes.indexOf(
      entrada
    );


  const indiceSaida =
    direcoes.indexOf(
      saida
    );


  const diferenca =
    (
      indiceSaida -
      indiceEntrada +
      4
    ) % 4;


  if (
    diferenca === 1
  ) {

    return "direita";

  }


  if (
    diferenca === 3
  ) {

    return "esquerda";

  }


  if (
    diferenca === 2
  ) {

    return "retorno";

  }


  return null;

}


/* =========================
   GRAU DO NÓ
========================= */

/*
  Conta quantos caminhos físicos
  chegam naquele ponto.

  3 ou mais = cruzamento.
*/

function obterGrauNo(
  no
) {

  let quantidade = 0;


  arestasRota.forEach(
    function(aresta) {

      if (
        aresta[0] === no ||
        aresta[1] === no
      ) {

        quantidade++;

      }

    }
  );


  return quantidade;

}


/* =========================
   TEXTO DO ORDINAL
========================= */

function numeroCruzamento(
  numero
) {

  return `${numero}º`;

}

/* =========================
   CRUZAMENTOS REAIS DO MAPA
========================= */

const nosCruzamentos =
  new Set([
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p"
  ]);

/* =========================
   GERA INSTRUÇÕES REAIS
========================= */

function gerarInstrucoesRota(
  caminho,
  coordenadas,
  numeroTotem,
  produto
) {

  const instrucoes = [];


  instrucoes.push(
    `Saindo do Totem ${numeroTotem}, siga em frente.`
  );


  let cruzamentosDesdeVirada = 0;


  for (
    let i = 1;
    i < caminho.length - 1;
    i++
  ) {

    const noAnterior =
      caminho[i - 1];


    const noAtual =
      caminho[i];


    const proximoNo =
      caminho[i + 1];


    if (
      noAtual === "destino"
    ) {

      break;

    }


    const pontoAnterior =
      coordenadas[noAnterior];


    const pontoAtual =
      coordenadas[noAtual];


    const proximoPonto =
      coordenadas[proximoNo];


    if (
      !pontoAnterior ||
      !pontoAtual ||
      !proximoPonto
    ) {

      continue;

    }


    /*
      Cada quadradinho verde
      físico conta como cruzamento.
    */

    if (
      nosCruzamentos.has(
        noAtual
      )
    ) {

      cruzamentosDesdeVirada++;

    }


    const direcaoEntrada =
      obterDirecao(
        pontoAnterior,
        pontoAtual
      );


    const direcaoSaida =
      obterDirecao(
        pontoAtual,
        proximoPonto
      );


    /*
      Se mudou de direção,
      existe uma virada.
    */

    if (
      direcaoEntrada !==
      direcaoSaida
    ) {

      const virada =
        obterVirada(
          direcaoEntrada,
          direcaoSaida
        );


      if (
        virada === "direita" ||
        virada === "esquerda"
      ) {

        if (
          cruzamentosDesdeVirada === 1
        ) {

          instrucoes.push(
            `No 1º cruzamento, vire à ${virada}.`
          );

        }


        else {

          instrucoes.push(
            `No ${cruzamentosDesdeVirada}º cruzamento, vire à ${virada}.`
          );

        }

      }


      /*
        Depois que virou,
        começa uma nova contagem.
      */

      cruzamentosDesdeVirada = 0;

    }

  }


  /*
    Caso ainda existam cruzamentos
    depois da última virada.
  */

  if (
    cruzamentosDesdeVirada === 1
  ) {

    instrucoes.push(
      "Passe pelo próximo cruzamento e continue em frente."
    );

  }


  else if (
    cruzamentosDesdeVirada > 1
  ) {

    instrucoes.push(
      `Passe por ${cruzamentosDesdeVirada} cruzamentos e continue em frente.`
    );

  }


  instrucoes.push(
    `Siga até a entrada da seção ${produto.secao}.`
  );


  instrucoes.push(
    `O produto está na prateleira ${produto.prateleira}.`
  );


  return instrucoes;

}


/* =========================
   VOZ DA ROTA
========================= */

let falaRotaAtual = null;


/* Converte 3º para "terceiro",
   2º para "segundo" etc. */

function prepararTextoParaVoz(
  texto
) {

  const ordinais = {

    "1º": "primeiro",
    "2º": "segundo",
    "3º": "terceiro",
    "4º": "quarto",
    "5º": "quinto",
    "6º": "sexto",
    "7º": "sétimo",
    "8º": "oitavo",
    "9º": "nono",
    "10º": "décimo"

  };


  let textoVoz =
    texto;


  Object.keys(
    ordinais
  )
    .forEach(
      function(numero) {

        textoVoz =
          textoVoz.replaceAll(
            numero,
            ordinais[numero]
          );

      }
    );


  return textoVoz;

}


/* =========================
   PARA A LEITURA
========================= */

function pararLeituraRota() {

  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis.cancel();

  }


  falaRotaAtual =
    null;


  const botao =
    document.getElementById(
      "botaoOuvirRota"
    );


  if (botao) {

    botao.classList.remove(
      "falando"
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
        <polygon
          points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
        ></polygon>

        <path
          d="M15.54 8.46a5 5 0 0 1 0 7.07"
        ></path>

        <path
          d="M19.07 4.93a10 10 0 0 1 0 14.14"
        ></path>
      </svg>

      Ouvir rota

    `;

  }

}


/* =========================
   LÊ A ROTA
========================= */

function ouvirRota(
  instrucoes
) {

  if (
    !("speechSynthesis" in window)
  ) {

    alert(
      "A leitura por voz não está disponível neste navegador."
    );

    return;

  }


  /*
    Para qualquer áudio anterior.
  */

  pararLeituraRota();


  const texto =
    prepararTextoParaVoz(
      instrucoes.join(
        " "
      )
    );


  const fala =
    new SpeechSynthesisUtterance(
      texto
    );


  fala.lang =
    "pt-BR";


  /*
    Um pouco mais devagar
    para facilitar a orientação.
  */

  fala.rate =
    0.88;


  fala.pitch =
    1;


  fala.volume =
    1;


  /*
    Tenta utilizar uma voz
    brasileira disponível.
  */

  const vozes =
    window
      .speechSynthesis
      .getVoices();


  const vozBrasil =
    vozes.find(
      function(voz) {

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


  falaRotaAtual =
    fala;


  const botao =
    document.getElementById(
      "botaoOuvirRota"
    );


  if (botao) {

    botao.classList.add(
      "falando"
    );


    botao.innerHTML = `

      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect
          x="6"
          y="5"
          width="4"
          height="14"
          rx="1"
        ></rect>

        <rect
          x="14"
          y="5"
          width="4"
          height="14"
          rx="1"
        ></rect>
      </svg>

      Reproduzindo...

    `;

  }


  fala.onend =
    function() {

      pararLeituraRota();

    };


  fala.onerror =
    function() {

      pararLeituraRota();

    };


  window
    .speechSynthesis
    .speak(
      fala
    );

}



window.addEventListener(
  "beforeunload",
  pararLeituraRota
);

function mostrarInstrucaoRota(
  numeroTotem,
  produto,
  instrucoes
) {

  /*
    Se estava falando a rota anterior,
    para ao trocar de totem.
  */

  pararLeituraRota();


  const area =
    document.getElementById(
      "instrucaoRota"
    );


  if (!area) {

    return;

  }


  const passos =
    instrucoes
      .map(
        function(instrucao, indice) {

          return `

            <div class="passo-rota">

              <span class="numero-passo">
                ${indice + 1}
              </span>

              <span>
                ${instrucao}
              </span>

            </div>

          `;

        }
      )
      .join("");


  area.innerHTML = `

    <strong class="titulo-rota">
      Rota iniciada no Totem ${numeroTotem}
    </strong>


    <div class="lista-passos-rota">

      ${passos}

    </div>


    <div class="acoes-voz">

      <button
        type="button"
        id="botaoOuvirRota"
        class="botao-ouvir-rota"
      >

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polygon
            points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
          ></polygon>

          <path
            d="M15.54 8.46a5 5 0 0 1 0 7.07"
          ></path>

          <path
            d="M19.07 4.93a10 10 0 0 1 0 14.14"
          ></path>
        </svg>

        Ouvir rota

      </button>


      <button
        type="button"
        id="botaoPararRota"
        class="botao-parar-rota"
      >

        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect
            x="6"
            y="6"
            width="12"
            height="12"
            rx="2"
          ></rect>
        </svg>

        Parar áudio

      </button>

    </div>

  `;


  area.classList.add(
    "visivel"
  );


  const botaoOuvir =
    document.getElementById(
      "botaoOuvirRota"
    );


  const botaoParar =
    document.getElementById(
      "botaoPararRota"
    );


  if (botaoOuvir) {

    botaoOuvir.addEventListener(
      "click",
      function() {

        ouvirRota(
          instrucoes
        );

      }
    );

  }


  if (botaoParar) {

    botaoParar.addEventListener(
      "click",
      pararLeituraRota
    );

  }

}


function mostrarErroMapa(
  mensagem
) {

  const area =
    document.getElementById(
      "informacoesMapa"
    );


  if (!area) return;


  area.innerHTML = `

    <div class="mensagem">
      ${mensagem}
    </div>

  `;
}

/* =========================================================
   RECUPERA O TOTEM ESCOLHIDO NA HOME
========================================================= */

function aplicarTotemSalvo(tentativa = 0) {

  const totemSalvo =
    sessionStorage.getItem(
      "anhanveraTotemSelecionado"
    );


  /*
    Nenhum totem foi escolhido na home.
  */

  if (!totemSalvo) {

    console.log(
      "Nenhum totem salvo."
    );

    return;

  }


  console.log(
    "Totem salvo:",
    totemSalvo
  );


  /*
    PRIMEIRO:
    tenta encontrar os botões T1, T2...
  */

  const botoes =
    document.querySelectorAll(
      ".botao-totem"
    );


  const botaoEncontrado =
    Array
      .from(botoes)
      .find(
        function (botao) {

          const numero =
            botao.dataset.totem ||
            botao.dataset.numero;


          const texto =
            botao
              .textContent
              .trim()
              .replace(/\s/g, "");


          return (
            String(numero) ===
              String(totemSalvo) ||

            texto ===
              "T" + totemSalvo
          );

        }
      );


  /*
    Se encontrou o botão,
    usa exatamente o clique normal
    da tela.
  */

  if (botaoEncontrado) {

    console.log(
      "Aplicando T" +
      totemSalvo
    );


    botaoEncontrado.click();

    return;

  }


  /*
    SEGUNDA OPÇÃO:
    caso a tela use SELECT.
  */

  const selectTotem =
    document.querySelector(
      ".seletor-totem select"
    ) ||

    document.getElementById(
      "totem"
    ) ||

    document.getElementById(
      "seletorTotem"
    );


  if (selectTotem) {

    selectTotem.value =
      totemSalvo;


    selectTotem.dispatchEvent(
      new Event(
        "change",
        {
          bubbles: true
        }
      )
    );


    console.log(
      "Totem aplicado no select:",
      totemSalvo
    );

    return;

  }


  /*
    O mapa ainda não terminou
    de carregar.

    Tenta novamente.
  */

  if (tentativa < 30) {

    setTimeout(
      function () {

        aplicarTotemSalvo(
          tentativa + 1
        );

      },
      150
    );

  }

}


/*
  Espera a página carregar
  completamente.
*/

window.addEventListener(
  "load",
  function () {

    setTimeout(
      function () {

        aplicarTotemSalvo();

      },
      300
    );

  }
);
