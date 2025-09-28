import { ProjectSettings } from "@assets/settings/company-settings";

export class FiltersTranslate {

  private static obj = {
    'pt_BR': {
      add: "Adicionar",
      active: "Ativos",
      noFilter: "Não há filtros ativos.",
    },
    'en_US': {
      add: "Add",
      active: "Active",
      noFilter: "There are no active filters.",
    }
  };

  public static get(language?: string) {
    return FiltersTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
