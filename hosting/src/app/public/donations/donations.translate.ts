import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class PublicDonationsTranslate {

  private static obj = {
    'pt_BR': {
			register:{
				success: ["Processo Realizado com sucesso."],
				error: {
					default: ["Algo deu errado, não foi possível realizar a operação."],
				},

				form:{
					donorName: "Nome do Doador",
					donationType: {
						label: "Tipo de Doação",
						data: {
							money: "DINHEIRO",
							others: "OUTROS"
						}
					},
					deliveryMode: {
						label: "Modo de Entrega",
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
        register: 'A doação foi registrada com sucesso.',
        update: 'A doação foi atualizada com sucesso.',
        cancel: 'A doação foi cancelada com sucesso.',
        delete: 'A doação foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de doação.',
        update: 'Atualização de doação.',
        cancel: 'Cancelamento de doação.',
        delete: 'Exclusão de doação.'
      }
    },
    'en_US': {
			register:{
				success: ["Process Successfully completed."],
				error: {
					default: ["Something went wrong, it was not possible to perform the operation."],
				},

				form:{
					donorName: "Donor Name",
					donationType: {
						label: "Donation Type",
						data: {
							money: "MONEY",
							others: "OTHERS"
						}
					},
					deliveryMode: {
						label: "Delivery Method",
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
        register: 'The donation was successfully registered.',
        update: 'The donation was successfully updated.',
        cancel: 'The donation was successfully canceled.',
        delete: 'The donation was successfully deleted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Donation registration',
        update: 'Donation update.',
        cancel: 'Donation cancellation.',
        delete: 'Donation exclusion.'
      }
    }
  };

  public static get(language?: string) {
    return Utilities.deepClone(PublicDonationsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language]);
  }

}
