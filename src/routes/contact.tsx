import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  useFetcher,
  useLoaderData,
} from "react-router-dom";
import { getContact, updateContact } from "../contacts";
import { Contact as ContactType } from "../types";

/**
 * * A UI DA ROTA DE CONTATO
 *
 * Em vez de uma página 404 "Não Encontrada", queremos realmente renderizar algo nas URLs que vinculamos. Para isso, precisamos criar uma nova rota.
 */

//CARREGAMENTO DE DADOS
//o React Router possui convenções de dados para inserir dados facilmente nos componentes da sua rota.
//Existem duas APIs que usaremos para carregar dados, loader e useLoaderData
//function de loader para carregar dados para root route componente
// eslint-disable-next-line no-irregular-whitespace
//Eles paramssão passados ​para o carregador com chaves que correspondem ao segmento dinâmico.
// eslint-disable-next-line react-refresh/only-export-components
export async function loader({ params }: LoaderFunctionArgs) {
  const contact = await getContact(params["contactId"] as string);
  //DADOS NÃO ENCONTRADOS
  //Sempre que você tiver um caso de erro esperado em um carregador ou ação – como os dados não existentes – você pode throw. A pilha de chamadas será interrompida, o React Router a capturará e o caminho do erro será renderizado em vez disso. Nem tentaremos renderizar um null contato.
  //Em vez de gerar um erro de renderização com Cannot read properties of null, evitamos o componente completamente e renderizamos o caminho do erro, informando ao usuário algo mais específico.
  if (!contact) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }
  return contact;
}

//cria uma action
//a action e onde o form de Favorite sera submetido, postado
//como o form não tem action ele e postado onde ele e renderizado
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  return updateContact(params["contactId"] as string, {
    favorite: formData.get("favorite") as FormDataEntryValue,
  });
}

//componente de contato
export default function Contact() {
  //acessando e renderizando os dados vindos do loader
  const data = useLoaderData() as ContactType | null;

  if (!data) {
    return <span>Contato Invalido</span>;
  }

  return (
    <div id="contact">
      <div>
        <img
          key={data.avatar}
          src={
            data.avatar || `https://robohash.org/${data.id}.png?size=200x200`
          }
        />
      </div>

      <div>
        <h1>
          {data.first || data.last ? (
            <>
              {data.first} {data.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={data} />
        </h1>

        {data.twitter && (
          <p>
            <a target="_blank" href={`https://twitter.com/${data.twitter}`}>
              {data.twitter}
            </a>
          </p>
        )}

        {data.notes && <p>{data.notes}</p>}

        <div>
          {
            //<Form> impede o comportamento padrão do navegador de enviar uma nova solicitação POST ao servidor, mas emula o navegador criando uma solicitação POST com roteamento do lado do cliente
            //O <Form action="destroy" > corresponde à nova rota em "contacts/:contactId/destroy" e envia a solicitação
            //Após o redirecionamento da ação, o React Router chama todos os carregadores de dados na página para obter os valores mais recentes (isso é "revalidação"). useLoaderDataretorna novos valores e faz com que os componentes sejam atualizados!
            //Adicione um formulário, adicione uma ação, o React Router faz o resto.
          }
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(event) => {
              if (!confirm("Please confirm you want to delete this record.")) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({
  contact,
}: {
  contact: {
    first: string;
    last: string;
    avatar: string;
    twitter: string;
    notes: string;
    favorite: boolean;
  };
}) {
  //MUTAÇÕES SEM NAVEGAÇÃO
  // é igualmente comum querer alterar dados sem causar uma navegação.
  //Para esses casos, temos o useFetcher hook. Ele nos permite comunicar com loaders e actions sem causar uma navegação.
  //O botão ★ na página de contato faz sentido para isso. Não estamos criando ou excluindo um novo registro, não queremos alterar páginas, queremos apenas alterar os dados na página que estamos olhando.
  //Há uma diferença fundamental: não é uma navegação: a URL não muda e o histórico não é afetado.
  const fetcher = useFetcher();
  //INTERFACE DE USUARIO OTIMISTA
  // Podemos usar uma estratégia chamada "optimistic UI"
  //O fetcher sabe que os dados do formulário estão sendo enviados para a ação, então eles estão disponíveis para você em fetcher.formData. Usaremos isso para atualizar imediatamente o estado da estrela, mesmo que a rede não tenha terminado. Se a atualização eventualmente falhar, a UI reverterá para os dados reais.
  //Em vez de sempre renderizar os dados reais, verificamos se o fetcher tem algum formData sendo enviado, se sim, usaremos isso em vez disso. Quando a ação for feita, o fetcher.formData não existirá mais e voltaremos a usar os dados reais. Então, mesmo se você escrever bugs em seu código de UI otimista, ele eventualmente retornará ao estado correto
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  //Este formulário enviará formData com uma favorite chave que é "true" | "false". Como ele tem , method="post"ele chamará a ação. Como não há <fetcher.Form action="...">prop, ele postará na rota onde o formulário é renderizado.
  return (
    <fetcher.Form method="POST">
      <button
        name="favorite"
        value={favorite ? "false" : "true"}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
