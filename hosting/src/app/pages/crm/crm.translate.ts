import { ProjectSettings } from "../../../assets/settings/company-settings";

export class CrmTranslate {
    private static obj = {
        'pt_BR': {
            header: {
                title: 'CRM - Gestão de Relacionamento',
                subtitle: 'Gerencie seus leads, oportunidades e relacionamentos',
                noPermission: 'Você não tem permissão para acessar o CRM'
            },
            menu: {
                dashboard: 'Dashboard',
                leads: 'Leads',
                pipeline: 'Pipeline',
                activities: 'Atividades',
                salesAnalysis: 'Análise de Vendas',
                birthdays: 'Aniversários',
                publicLink: 'Link Público'
            }
        },
        'en_US': {
            header: {
                title: 'CRM - Customer Relationship Management',
                subtitle: 'Manage your leads, opportunities and relationships',
                noPermission: 'You do not have permission to access the CRM'
            },
            menu: {
                dashboard: 'Dashboard',
                leads: 'Leads',
                pipeline: 'Pipeline',
                activities: 'Activities',
                salesAnalysis: 'Sales Analysis',
                birthdays: 'Birthdays',
                publicLink: 'Public Link'
            }
        }
    };

    public static get(language?: string) {
        return CrmTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
    }
}