import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class MainTranslate {

  private static obj = {
    'pt_BR': {
			login: {
				success: ["Login realizado com sucesso!"],
				error: {
					noPaid: ["Acesso revogado.",  "Verifique se sua mensalidade encontra-se paga e caso necessário contate o suporte técnico."],
					default: ["Usuário ou senha inválidos.", "Se o problema persistir contate o administrador."],
					lockedAccess: ["Acesso Bloqueado.",  "Seu usuário teve o acesso ao sistema bloqueado."]
				},
				title: {
					error: "Falha ao realiza Login",
					sucess: "Bem Vindo",
				},
				form: {
					username: "Nome de usuário:",
					password: "Senha",
					forgotPassword: "Esqueceu a senha?",
					button: {
						submit: "Acessar"
					}
				}
			},
			requestPassword:{
				success: ["Verifique seu email e acesse o link para redefinir sua senha."],
				error: {
					default: ["Verifique seu nome de usuário.","Se o problema persitir contate o administrador."],
				},

				form:{
					username: "Username:",
					backToLogin: "Voltar ao login",
					button:{
						submit: "Requisitar senha",
					}
				},

				title: {
					error: "Algo deu errado!",
					sucess: "Processo realizado com sucesso!",
				},
				
			}
    },
    'en_US': {
      login: {
				success: ["Login successfully!"],
				error: {
					noPaid: ["Access revoked.",  "Check if your monthly fee is paid and if necessary contact technical support."],
					default: ["Username or password is invalid.", "If the problem persists, contact your administrator."],
					lockedAccess: ["Blocked Access.",  "Your user has been blocked from accessing in the system."]
				},
				title: {
					error: "Fail in realize login",
					sucess: "Welcome",
				},
				form: {
					username: "Username:",
					password: "Password",
					forgotPassword: "Forgot the Password?",
					button: {
						submit: "Access",
					}
				}
			},
			requestPassword:{
				success: ["Access your email and click in the link to reset the password."],
				error: {
					default: ["Check your username.","If the problem persists contact the administrator."],
				},

				form:{
					username: "Username:",
					backToLogin: "Back to Login",
					button:{
						submit: "Request Password",
					}
				},

				title: {
					sucess: "Process realized with sucess!",
					error: "Something went wrong!"
				},
				
			}
    }
  }

  public static get(language?: string) {
    return Utilities.deepClone(MainTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language]);
  }

}
