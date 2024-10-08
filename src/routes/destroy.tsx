import { ActionFunctionArgs, redirect } from "react-router-dom";
import { deleteContact } from "../contacts";

/**
 * * EXCLUINDO REGISTROS
 *
 * UI para renderizar a rota de "destroy"
 */

//configurando a action de destroy
//quando o form com a action destroy for submetido ira ser postado aqui
export async function action({ params }: ActionFunctionArgs) {
  await deleteContact(params["contactId"] as string);
  return redirect("/");
}
