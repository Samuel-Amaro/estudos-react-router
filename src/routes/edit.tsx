import {
  ActionFunctionArgs,
  Form,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { Contact } from "../types";
import { updateContact } from "../contacts";

//ATUALIZANDO CONTATOS COM FormData
//criamos uma action que quando o formulario de edição for submetido ira passar por aqui
//o form sera postado nessa action e os dados serão automaticamente revalidados
// Sem o roteamento do lado do cliente, se um servidor redirecionasse após uma solicitação POST, a nova página buscaria os dados mais recentes e renderizaria. Como aprendemos antes, o React Router emula esse modelo e revalida automaticamente os dados na página após a ação.
//É por isso que a barra lateral é atualizada automaticamente quando salvamos o formulário. O código de revalidação extra não existe sem o roteamento do lado do cliente, então ele também não precisa existir com o roteamento do lado do cliente!
// eslint-disable-next-line react-refresh/only-export-components
export async function action({ request, params }: ActionFunctionArgs) {
  //Sem JavaScript, quando um formulário é enviado, o navegador o criará FormDatae o definirá como o corpo da solicitação quando ele o enviar para o servidor. Como mencionado antes, o React Router previne isso e envia a solicitação para sua ação, incluindo o FormData.
  const formData = await request.formData();
  //Como temos vários campos de formulário, costumávamos Object.fromEntriesreuni-los todos em um objeto, que é exatamente o que nossa updateContact função deseja.
  const updates = Object.fromEntries(formData);
  await updateContact(params["contactId"] as string, updates);
  //loader e action podem retornar um Response (faz sentido, já que eles receberam um Request!). O redirect helper apenas torna mais fácil retornar uma resposta que diz ao aplicativo para mudar de local.
  return redirect(`/contacts/${params.contactId}`);
}

//ATUALIZANDO DADOS
//ROTA PARA EDIÇÃO DE CONTATO
//COMPONENTE QUE IRA RENDERIZAR FORM PARA EDITAR CONTATO

export default function EditContact() {
  const contact = useLoaderData() as Contact | null;
  //O useNavigate gancho retorna uma função que permite navegar programaticamente,
  const navigate = useNavigate();

  return (
    <Form method="post" id="contact-form">
      <p>
        <span>Name</span>
        <input
          placeholder="First"
          aria-label="First name"
          type="text"
          name="first"
          defaultValue={contact?.first}
        />
        <input
          placeholder="Last"
          aria-label="Last name"
          type="text"
          name="last"
          defaultValue={contact?.last}
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          type="text"
          name="twitter"
          placeholder="@jack"
          defaultValue={contact?.twitter}
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          placeholder="https://example.com/avatar.jpg"
          aria-label="Avatar URL"
          type="text"
          name="avatar"
          defaultValue={contact?.avatar}
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea name="notes" defaultValue={contact?.notes} rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button
          type="button"
          onClick={() => {
            //Agora, quando o usuário clicar em "Cancelar", ele será enviado de volta para uma entrada no histórico do navegador.
            navigate(-1);
          }}
        >
          Cancel
        </button>
      </p>
    </Form>
  );
}
