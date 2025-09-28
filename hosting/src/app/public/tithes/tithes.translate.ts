import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class PublicTithesTranslate {

	private static obj = {
    'pt_BR': {
			register:{
				success: ["Processo Realizado com sucesso."],
				error: {
					default: ["Algo deu errado, não foi possível realizar a operação."],
				},

				form:{
					memberName: "Nome do Membro",
					paymentMode: {
						label: "Modo de Pagamento",
						data: {
							online: "ONLINE",
							presential: "PRESENCIAL"
						}
					},
					value: "Valor",
					description: "Descrição",
					button:{
						submit: "Realizar",
					}
				},

				title: {
					error: "Algo deu errado!",
					sucess: "Processo realizado com sucesso!",
				},
				
			},
			notification: {
        register: 'O dízimo foi registrado com sucesso.',
        update: 'O dízimo  foi atualizado com sucesso.',
        cancel: 'O dízimo  foi cancelado com sucesso.',
        delete: 'O dízimo  foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de dízimo.',
        update: 'Atualização de dízimo.',
        cancel: 'Cancelamento de dízimo.',
        delete: 'Exclusão de dízimo.'
      }
    },
    'en_US': {
			register:{
				success: ["Process Successfully completed."],
				error: {
					default: ["Something went wrong, it was not possible to perform the operation."],
				},

				form:{
					memberName: "Member Name",
					paymentMode: {
						label: "Payment Mode",
						data: {
							online: "ONLINE",
							presential: "PRESENTIAL"
						}
					},
					value: "Value",
					description: "Description",
					button:{
						submit: "Make",
					}
				},

				title: {
					error: "Something went wrong!",
					sucess: "Process successfully completed!",
				},
				
			},
			notification: {
        register: 'The tithe was successfully registered.',
        update: 'The tithe was successfully updated.',
        cancel: 'The tithe was successfully canceled.',
        delete: 'The tithe was successfully deleted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Tithe registration',
        update: 'Tithe update.',
        cancel: 'Tithe cancellation.',
        delete: 'Tithe exclusion.'
      }
    }
  };

  public static get(language?: string) {
    return Utilities.deepClone(PublicTithesTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language]);
  }

}
