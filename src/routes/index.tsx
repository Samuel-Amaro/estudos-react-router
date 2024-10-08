/**
 * * INDEX ROUTE
 *
 *  Ao carregar o aplicativo, você notará uma grande página em branco no lado direito da nossa lista.
 *
 * Quando uma rota tem filhos, e você está no caminho da rota pai, ela <Outlet> não tem nada para renderizar porque nenhum filho corresponde. Você pode pensar em rotas de índice como a rota filho padrão para preencher esse espaço.
 */

export default function Index() {
  return (
    <p id="zero-state">
      This is a demo for React Router.
      <br />
      Check out{" "}
      <a href="https://reactrouter.com">the docs at reactrouter.com</a>.
    </p>
  );
}
