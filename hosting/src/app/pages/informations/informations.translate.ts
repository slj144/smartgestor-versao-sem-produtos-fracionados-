import { ProjectSettings } from "../../../assets/settings/company-settings";

export class InformationsTranslate{

	private static data = {
		"pt_BR": {
			titles: {
				main: "Informações"
			},
			notifications: {
				updateStoreWithSuccess: "Informações atualizadas com sucesso.",
				updateStoreWithError: "Ocorreu um erro inesperado. Não foi possivel atualizar as informações.",

				registerLimit: "O limite de registro de filiais foi atingido.",
				credentialsSendedWithSuccess: (email: string)=>{ return `Email enviado para ${ email } com as credênciais de login.` },
				credentialsSendedWithError: "Algo deu errado ao enviar email com as credênciais de login.",

				upload:{
					error: "Ocorreu um erro ao realizar upload da imagem do administrador."
				},

				email: {
					collaborators: "Colaboradores",
					title: "Credenciais de Login",
					message: (email: string)=>{ return "A mesma senha cadastrada anteriormente com esse email "+ email},
					yourCredentials: "SUAS CREDÊNCIAIS DE LOGIN"
				},

				requestPassword: {
          success: (email: string)=>{ return `Verifique o email ${ email } e acesse o link para redefinir sua senha.` },
          error: "Erro ao requisitar nova senha."
        },

				revokedAccess: "Acesso Revogado, verifique se sua fatura esta paga, caso necessário contate o suporte técnico."
			},
			systemLogs: {
				updateInformations: "Atualizar Informações."
			},
			mainModal: {
				viewTitle: "Detalhes do Informações",
				editTitle: "Editar Informações",
				helpTitle: "Ajuda",

				requestNewPassword: "Requisitar Nova Senha",
				storeBillingName: "Nome no faturamento",
				storeSystemName: "Nome no sistema",
				adminAccount: "Conta do administrador",
				user: "Usuário",
				username: "Username",
				userAccount: "Conta de usuário",
				code: "Código",
				name: "Nome",
				admin: "Administrador",
				actions: "Ações",

				address: {
					title: "Endereço",
					addressLine: "Logradouro",
					postalCode: "CEP",
					state: "Estado",
					city: "Cidade",
					district: "Bairro",
					complement: "Complemento",
					number: "Número"
				},
	
				contacts: {
					title: "Contatos",
					email: "E-mail",
					phone: "Telefone",
					whatsapp: "Whatsapp"
				},

				branchRemoveConfirmation: "Você deseja realmente remover esta empresa parceira?",
				confirm: "Confirmar",
				cancel: "Cancelar",
				requiredFields: "Os campos em vermelho são obrigatórios."
			}
		},
		"en_US": {
			titles: {
				main: "Informations",
			},
			notifications: {
				updateStoreWithSuccess: "Informations updated successfully.",
				updateStoreWithError: "An unexpected error has occurred. It was not possible to update the data of the informations.",

				credentialsSendedWithSuccess: (email: string)=>{ return `Email sent to ${ email } with login credentials.` },
				credentialsSendedWithError: "Something went wrong when sending email with login credentials.",

				
				upload:{
					error: "An error occurred while uploading the administrator image."
				},

				email: {
					collaborators: "Collaborators",
					title: "Login Credentials",
					yourCredentials: "YOUR LOGIN CREDENTIALS",
					message: (email: string)=>{ return "The same password previously registered with this email "+ email},
				},

				requestPassword: {
          success: (email: string)=>{ return `Check email ${ email } and access the link to reset your password.` },
          error: "Erro ao requisitar nova senha."
        },

				revokedAccess: "Revoked access, check if your invoice is paid, if necessary contact technical support."
			},
			systemLogs: {
				updateInformations: "Update Informations.",
			},
			mainModal: {
				viewTitle: "Informations Details",
				editTitle: "Edit Informations",
				helpTitle: "Help",
				filtersTitle: "Filters",

				requestNewPassword: "Request new password",
				adminAccount: "Administrator Account",
				user: "User",
				username: "Username:",
				userAccount: "User account",
				admin: "Administrator",
				actions: "Actions",
				code: "Code",
				name: "Name",
				storeBillingName: "Billing Name",
				storeSystemName: "System Name",

				address: {
					title: "Address",
					addressLine: "Address Line",
					postalCode: "Postal Code",
					state: "State",
					city: "City",
					district: "District",
					complement: "Complement",
					number: "Number"
				},

				placeholder: {
					email: {
						contact: ""
					}
				},

				contacts: {
					title: "Contacts",
					email: "E-mail",
					phone: "Phone",
					whatsapp: "whatsapp"
				},

				confirm: "Confirm",
				cancel: "Cancel",
				mandatoryFields: "The red fields are mandatory."
			}
		}
	};

  public static get(language?: string) {
    return InformationsTranslate.data[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }
  
}