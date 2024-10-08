import {
  Form,
  LoaderFunctionArgs,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { createContact, getContacts } from "../contacts";
import { Contact } from "../types";
import { useEffect } from "react";

/**
 * * A ROTA DA RAIZ
 *
 * esse e o layout global para este aplicativo
 */

//CRIANDO CONTATOS
//exporta uma action em nosa rota raiz
//que ira fazer uma action de criar um novo contato quando submeter um form
//quando o form for submetido ira ser postado nessa action aqui
// eslint-disable-next-line react-refresh/only-export-components
export async function action() {
  const contact = await createContact();
  //redireciona para a page de edição de novo registro
  return redirect(`/contacts/${contact.id}/edit`);
}

//CARREGAMENTO DE DADOS
//o React Router possui convenções de dados para inserir dados facilmente nos componentes da sua rota.
//Existem duas APIs que usaremos para carregar dados, loader e useLoaderData
//function de loader para carregar dados para root route componente
// eslint-disable-next-line react-refresh/only-export-components
export async function loader({ request }: LoaderFunctionArgs) {
  //filtra a lista de contatos se houver URLSearchParams na url, que e add na url quando o usuario submeteu o form de pesquisa, causando uma alteração na url, nesse caso form com method get vem para loader porque so altera url não faz request (para ir para action) e so alteração da url, como se estivesse clicando em um link normal
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q ?? undefined);
  return { contacts, q };
}

//este e o componente de layout raiz
export default function Root() {
  //acessando e renderizando os dados vindos do loader
  const { contacts, q } = useLoaderData() as {
    contacts: Contact[];
    q: string | null;
  };
  //UI GLOBAL PENDENTE
  //O React Router está gerenciando todo o estado nos bastidores e revela as partes dele que você precisa para construir aplicativos web dinâmicos. Neste caso, usaremos o useNavigationhook.
  //useNavigation retorna o estado de navegação atual: pode ser um dos seguintes "idle" | "submitting" | "loading".
  const navigation = useNavigation();
  const submit = useSubmit();

  //add spinner de pesquisa
  //Para uma melhor UX, vamos adicionar algum feedback imediato da UI para a busca.
  //O navigation.location aparecerá quando o aplicativo estiver navegando para uma nova URL e carregando os dados para ela. Ele então desaparecerá quando não houver mais navegação pendente.
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  // Sincronizar valor de input com os parâmetros de pesquisa de URL
  useEffect(() => {
    const elem = document.getElementById("q") as HTMLInputElement;
    elem.value = q ?? "";
  }, [q]);

  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          {
            //ENVIOS GET COM ROTEAMENTO DO LADO DO CLIENT
            //Vamos usar o roteamento do lado do cliente para enviar este formulário e filtrar a lista em nosso LOADER existente.
            //Note que este formulário é diferente dos outros que usamos, ele não tem <form method="post">. O padrão methodé "get". Isso significa que quando o navegador cria a solicitação para o próximo documento, ele não coloca os dados do formulário no corpo POST da solicitação, mas no de URLSearchParamsuma solicitação GET.
            //Como este é um GET, não um POST, o React Router não chama o action. Enviar um formulário GET é o mesmo que clicar em um link: apenas a URL muda. É por isso que o código que adicionamos para filtragem está no loader, não no actiondesta rota.
            //Isso também significa que é uma navegação de página normal. Você pode clicar no botão voltar para voltar para onde estava.
          }
          <Form id="search-form" role="search">
            <input
              id="q"
              className={searching ? "loading" : ""}
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
              defaultValue={q ?? undefined} //define o q como valor default do input, o q e a query no param url
              onChange={(e) => {
                //submter o form a cada pressionamento de tecla no input
                // substituindo a entrada atual na pilha de histórico pela próxima página, em vez de pressionar nela.
                //Queremos substituir apenas os resultados da pesquisa, não a página anterior ao início da pesquisa, então fazemos uma verificação rápida para saber se esta é a primeira pesquisa ou não e então decidimos substituir.
                //Cada pressionamento de tecla não cria mais novas entradas, então o usuário pode clicar para sair
                const isFirstSearch = q === null;
                // O currentTargeté o nó DOM ao qual o evento está anexado, e o currentTarget.formé o nó do formulário pai da entrada. A submitfunção serializará e enviará qualquer formulário que você passar para ela.
                submit(e.currentTarget.form, {
                  replace: !isFirstSearch,
                });
              }}
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          {/*O componente Form é um wrapper em torno de um formulário HTML simples que emula o navegador para roteamento do lado do cliente e mutações de dados. Não é uma biblioteca de validação de formulário/gerenciamento de estado como você pode estar acostumado no ecossistema React
          //<Form>impede que o navegador envie a solicitação ao servidor e a envia para sua rota action. Na semântica da web, um POST geralmente significa que alguns dados estão mudando. Por convenção, o React Router usa isso como uma dica para revalidar automaticamente os dados na página após a conclusão da ação. Isso significa que todos os seus useLoaderDatahooks são atualizados e a UI permanece sincronizada com seus dados automaticamente! Muito legal.
          */}
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  {
                    //O roteamento do lado do cliente permite que nosso aplicativo atualize a URL sem solicitar outro documento do servidor. Em vez disso, o aplicativo pode renderizar imediatamente uma nova UI. Vamos fazer isso acontecer com <Link> ou NavLink.
                    //Note que estamos passando uma função para className. Quando o usuário estiver na URL em NavLink, then isActiveserá true. Quando estiver prestes a ficar ativo (os dados ainda estão carregando), then isPendingserá true. Isso nos permite indicar facilmente onde o usuário está, bem como fornecer feedback imediato sobre links que foram clicados, mas ainda estamos esperando os dados carregarem.
                  }
                  <NavLink
                    to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div
        id="detail"
        className={
          // usando o hook useNavigation para adicionar UI global pendente
          //useNavigation retorna o estado de navegação atual: pode ser um dos seguintes "idle" | "submitting" | "loading".
          navigation.state === "loading" ? "loading" : ""
        }
      >
        {/*Informando ao componente de layout raiz onde queremos que ela renderize as rotas filhas*/}
        <Outlet />
      </div>
    </>
  );
}
