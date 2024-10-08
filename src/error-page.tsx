import { useRouteError } from "react-router-dom";

//criando um componente de página de error
//Sempre que seu aplicativo lançar um erro ao renderizar, carregar dados ou executar mutações de dados, o React Router o pegará e renderizará uma tela de erro. Vamos fazer nossa própria página de erro.]
//Por enquanto, basta saber que praticamente todos os seus erros agora serão tratados por esta página, em vez de spinners infinitos, páginas que não respondem ou telas em branco 🙌
export default function ErrorPage() {
  //useRouteError fornece o erro que foi lançado.
  const error = useRouteError() as { statusText: string; message: string };
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}
