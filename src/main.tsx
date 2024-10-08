import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root, {
  loader as rootLoader,
  action as rootAction,
} from "./routes/root";
import ErrorPage from "./error-page";
import Contact, {
  loader as contactLoader,
  action as contactAction,
} from "./routes/contact";
import EditContact, { action as editAction } from "./routes/edit";
import { action as destroyAction } from "./routes/destroy";
import Index from "./routes";

//1 - CRIANDO E CONFIGURANDO UM ROTEADOR(ROUTER)
//1.1 ISSO HABILITARA O ROTEAMENTO DO LADO DO CLIENT
const router = createBrowserRouter([
  //1.2 CONFIGURA A PRIMEIRA ROTA CHAMADA DE ROOT(RAIZ)
  //1.3 SERVIRA COMO LAYOUT RAIZ DA UI
  //1.4 DEFINIMOS O COMPONENTE ROOT COMO A ROTA RAIZ EM ELEMENT
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />, //definindo o componente <ErrorPage> para ser renderizado quando estourar qualquer tipo de error, sera tratada por esse componente,
    loader: rootLoader, //conectando a function loader na rota raiz, configurando o loader na rota para informar que queremos carregar os dados vindo da rootLoader na nosso componente <Root />
    action: rootAction, //define uma action para a rota raiz, para criar um contato quando o form na rota raiz for submetido
    children: [
      //Uma última coisa. A última página de erro que vimos seria melhor se fosse renderizada dentro do outlet raiz, em vez da página inteira. Na verdade, cada erro em todas as nossas rotas filhas seria melhor no outlet, então o usuário tem mais opções do que apertar refresh.
      //Rotas podem ser usadas sem um caminho, o que permite que elas participem do layout da IU sem exigir novos segmentos de caminho na URL.
      //envolvedo as rotas filhas em uma rota sem caminho
      //Quando algum erro for gerado nas rotas secundárias, nossa nova rota sem caminho o detectará e renderizará, preservando a interface do usuário da rota raiz!
      {
        errorElement: <ErrorPage />,
        children: [
          //rotas aninhadas
          //informar rotas filhas de root
          {
            //configurando a index route, a route filha padrão para na primeira renderização da aplicação ele aparece default
            //Observe o { index:true }em vez de { path: "" }. Isso diz ao roteador para corresponder e renderizar esta rota quando o usuário estiver no caminho exato da rota pai, então não há outras rotas filhas para renderizar no <Outlet>.
            index: true,
            element: <Index />,
          },
          {
            //nova rota para visualizar um contato
            //queremos que o componente de contato seja renderizado dentro do <Root /> componente de layout
            //fazemos isso tornando a rota de contato um filha da rota raiz
            //Os dois pontos ( :) têm um significado especial, transformando-o em um "segmento dinâmico". Segmentos dinâmicos corresponderão a valores dinâmicos (mutáveis) naquela posição da URL, como o ID do contato. Chamamos esses valores na URL de "URL Params", ou apenas "params" para abreviar.
            path: "contacts/:contactId",
            element: <Contact />, //o componente que renderiza a ui para visualizar um contato,
            loader: contactLoader, //define um loader de dados para a rota
            action: contactAction, //quando o form favorite for submetido sera posta nessa action
          },
          {
            //add uma rota para editar contato
            path: "contacts/:contactId/edit",
            element: <EditContact />,
            loader: contactLoader,
            action: editAction, //quando o form do componente EditContat for submetido ira ser postado nessa action
          },
          {
            //add a rota de destroy
            path: "contacts/:contactId/destroy",
            action: destroyAction,
            errorElement: <div>Oops! There was an error.</div>, //cria uma mensagem de erro contextual para a rota de destroy
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
