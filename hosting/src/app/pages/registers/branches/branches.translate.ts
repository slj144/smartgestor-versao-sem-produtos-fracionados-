import { ProjectSettings } from "@assets/settings/company-settings";

export class BranchesTranslate{

	private static data = {
		pt_BR: {
			titles: {
				main: "Filiais",
				nodataPlaceholder: "Não há dados a serem listados.",
			},
			mainModal: {
				viewTitle: "Visualizar Filial",
				addTitle: "Adicionar Filial",
				editTitle: "Editar Filial",
				deleteTitle: "Deletar Filial",
				helpTitle: "Ajuda",
				filtersTitle: "Filtros",

				storeBillingName: "Nome da loja no faturamento",
				storeSystemName: "Nome daloja no sistema",
				adminAccount: "Conta do administrador",
				user: "Usuário:",
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
			},
			notifications: {
				registerBranchWithSuccess: "Filial registrada com sucesso.",
				registerBranchWithError: "Ocorreu um erro inesperado. Não foi possivel registrar a filial.",
				updateBranchWithSuccess: "Filial atualizada com sucesso.",
				updateBranchWithError: "Ocorreu um erro inesperado. Não foi possivel atualizar a filial.",
				deleteBranchWithSuccess: "Filial removida com sucesso.",
				deleteBranchWithError: "Ocorreu um erro inesperado. Não foi possivel remover a filial.",

				registerLimit: "O limite de registro de filiais foi atingido.",
				credentialsSendedWithSuccess: (email: string)=>{ return `Email enviado para ${ email } com as credênciais de login.` },
				credentialsSendedWithError: "Algo deu errado ao enviar email com as credênciais de login.",

				email: {
					title: "Credenciais de Login",
					message: (email: string)=>{ return "A mesma senha cadastrada anteriormente com esse email "+ email},
				}
			},
			systemLogNotes: {
				registerOS: "Registro de Filial.",
				deleteOS: "Deleção de Filial.",
				updateOS: "Atualização de Filial.",
			},
		},
		en_US: {
			titles: {
				main: "Branches",
				nodataPlaceholder: "There is no data to list.",
			},
			mainModal: {
				viewTitle: "View Branch",
				addTitle: "Add Branch",
				editTitle: "Edit Branch",
				deleteTitle: "Delete Branch",
				helpTitle: "Help",
				filtersTitle: "Filters",

				adminAccount: "Administrator Account",
				user: "User",
				userAccount: "User account",
				admin: "Administrator",
				actions: "Actions",
				code: "Code",
				name: "Name",
				storeBillingName: "Store Billing Name",
				storeSystemName: "Store System Name",

				address: {
					title: "Address",
					addressLine: "Address Line",
					postalCode: "PostalCode",
					state: "State",
					city: "City",
					district: "District",
					complement: "Complement",
					number: "Number"
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
			},
			notifications: {
				registerBranchWithSuccess: "Branch registered successfully.",
				registerBranchWithError: "An unexpected error has occurred. It was not possible to register the Branch.",
				updateBranchWithSuccess: "Branch updated successfully.",
				updateBranchWithError: "An unexpected error has occurred. It was not possible to update the Branch.",
				deleteBranchWithSuccess: "Branch successfully removed.",
				deleteBranchWithError: "An unexpected error has occurred. It was not possible to remove the Branch.",

				registerLimit: "The registration limit for branches has been reached.",
				credentialsSendedWithSuccess: (email: string)=>{ return `Email sent to ${ email } with login credentials.` },
				credentialsSendedWithError: "Something went wrong when sending email with login credentials.",

				email: {
					title: "Login Credentials",
					message: (email: string)=>{ return "The same password previously registered with this email "+ email},
				}
			},
			systemLogNotes: {
				registerOS: "Branch register.",
				deleteOS: "Branch deletion.",
				updateOS: "Branch update.",
			},
		}
	};

	public static get() {
		return BranchesTranslate.data[window.localStorage.getItem('Language') ? window.localStorage.getItem('Language') : ProjectSettings.companySettings().language];
	}
  
}