const inputCnpj = document.querySelector("#inputCnpj");
const botaoSubmit = document.querySelector("#submit");
const divInformacoes = document.querySelector(".info");

const divConsultasPassdas = document.querySelector(".consultas");
const divConsultasPassdasContainer = document.querySelector(
  ".consultasContainer"
);
const botaoMostrarConsultas = document.querySelector("#mostrarConsultas");

botaoMostrarConsultas.addEventListener("click", mostrarConsultasPassadas);
botaoSubmit.addEventListener("click", verificarAndConsultar);

//verificar se o cnpj é "valido" e entao consultar()
function verificarAndConsultar() {
  const cnpj = inputCnpj.value.replace(/[^\d]+/g, "");
  //mostrar erro se for invalido
  if (!cnpj || cnpj.length !== 14) {
    document.querySelector(".erro").innerHTML = "CNPJ inválido";
    return;
  }

  //remover msgs de erros e consultar
  document.querySelector(".erro").innerHTML = "";
  consultar(cnpj);
}

//realizar a consulta por cnpj
function consultar(cnpj, isVisualizandoNovamente = false) {
  //rolar a tela para cima, caso a pessoa tenha clicado em visualizar uma consulta passada
  window.scrollTo({ top: 0, behavior: "smooth" });

  //avisar o servidor para nao resgistrar no banco uma nova consulta
  //por estar simplesmente revendo uma consulta passada
  const queryString = isVisualizandoNovamente
    ? "?isVisualizandoNovamente=true"
    : "";

  const mensagemPadrao = "Não informado"; //mensagem mostrada em campos sem valor

  //requisitar ao servidor que ele faça a requisicao para a api com o cnpj passado
  fetch("http://localhost:5000/consultas/" + cnpj + queryString, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((response) => {
      //organizar informacoes da api
      const informacoes = {
        name: response.name,
        alias: response.alias,
        city: response["address"] && response["address"].city,
        street: response["address"] && response["address"].street,
        number: response["address"] && response["address"].number,
        state: response["address"] && response["address"].state,
        capital: response.capital,
        email: response.email,
        phone: response.phone,
        status: response["registration"] && response["registration"].status,
      };

      //adicionar as informacoes a tela
      //caso nao haja valor, a msg padrao sera exibida
      document.querySelector(".name").innerHTML =
        informacoes["name"] || mensagemPadrao;

      document.querySelector(".alias").innerHTML =
        informacoes["alias"] || mensagemPadrao;

      document.querySelector(".city").innerHTML =
        informacoes["city"] || mensagemPadrao;

      document.querySelector(".street").innerHTML =
        informacoes["street"] || mensagemPadrao;

      document.querySelector(".number").innerHTML =
        informacoes["number"] || mensagemPadrao;

      document.querySelector(".state").innerHTML =
        informacoes["state"] || mensagemPadrao;

      document.querySelector(".capital").innerHTML =
        informacoes["capital"] || mensagemPadrao;

      document.querySelector(".email").innerHTML =
        informacoes["email"] || mensagemPadrao;

      document.querySelector(".phone").innerHTML =
        informacoes["phone"] || mensagemPadrao;

      document.querySelector(".status").innerHTML =
        informacoes["status"] || mensagemPadrao;

      //mudar o cnpj do input para o cnpj da requisisao
      //para caso a pessao esteja revendo uma consulta passada
      inputCnpj.value = cnpj;

      //caso nao esteja revendo uma consulta passada, listar a nova consulta na lista
      if (!isVisualizandoNovamente) {
        adicionarConsultaNaLista(cnpj);
      }
    })
    .catch((err) => {
      //caso o cnpj nao exista ou nao haja informações sobre ele, mostrara a msg padrao
      document.querySelector(".name").innerHTML = mensagemPadrao;

      document.querySelector(".alias").innerHTML = mensagemPadrao;

      document.querySelector(".city").innerHTML = mensagemPadrao;

      document.querySelector(".street").innerHTML = mensagemPadrao;

      document.querySelector(".number").innerHTML = mensagemPadrao;

      document.querySelector(".state").innerHTML = mensagemPadrao;

      document.querySelector(".capital").innerHTML = mensagemPadrao;

      document.querySelector(".email").innerHTML = mensagemPadrao;

      document.querySelector(".phone").innerHTML = mensagemPadrao;

      document.querySelector(".status").innerHTML = mensagemPadrao;
    });
}

//requisitar e colocar na tela todas as consultas ja feitas pelo ip do cliente atual
function mostrarConsultasPassadas() {
  //esconder o botao de mostrar e mostrar a div onde as consultas ficarao
  divConsultasPassdasContainer.hidden = false;
  botaoMostrarConsultas.hidden = true;

  //fazer a requisicao para o servidor
  fetch("http://localhost:5000/consultas/", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((response) => {
      const consultas = response.results;

      //mostrar mensagem caso nao hajam consultas previas
      if (!consultas || consultas.length === 0) {
        divConsultasPassdas.innerHTML = "<p>Não há mais consultas</p>";
        return;
      }

      //montar os elementos da lista de consultas passadas
      let content = "";
      consultas.forEach((consulta) => {
        //formatar o cnpj e a data
        const cnpjAtual = consulta.cnpj.replace(
          /(\d{3})(\d{3})(\d{3})(\d{2})/,
          "$1.$2.$3-$4"
        );
        const dataAtual = new Date(consulta.t).toLocaleString("pt-BR");

        //adicionar consulta a lista de consultas
        content += `
          <div class="consulta">
              <p>CNPJ: ${cnpjAtual}</p>
              <p>Consultado em: ${dataAtual}</p>
              <button onClick="consultar(${
                "'" + consulta.cnpj + "', true"
              })">Visualizar</button>
          </div>`;
      });
      divConsultasPassdas.innerHTML = content; //inserir a lista de consultas no html
    });
}

//adicionar a ultima consulta feita na lista
function adicionarConsultaNaLista(cnpj) {
  //somente adicionar se a lista estiver sendo mostrada
  if (!divConsultasPassdasContainer.hidden) {
    divConsultasPassdas.innerHTML =
      `
    <div class="consulta">
        <p>CNPJ: ${cnpj.replace(
          /(\d{3})(\d{3})(\d{3})(\d{2})/,
          "$1.$2.$3-$4"
        )}</p>
        <p>Consultado em: ${"Recentemente"}</p>
        <button onClick="consultar(${
          "'" + cnpj + "', true"
        })">Visualizar</button>
    </div>` + divConsultasPassdas.innerHTML;
  }
}
