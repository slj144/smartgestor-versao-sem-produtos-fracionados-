import { ProjectSettings } from '@assets/settings/company-settings';

const getLanguage = () => {
  return (
    window.localStorage.getItem('Language') ??
    ProjectSettings.companySettings().language ??
    'pt_BR'
  );
};

export class MotoRentalTranslate {
  private static readonly map = {
    'pt_BR': {
      title: 'Aluguel de Motos e Vans',
      subtitle: 'Controle completo da frota de cortesia para oficinas do Reino Unido.',
      tabs: {
        dashboard: 'Painel',
        fleet: 'Frota',
        contracts: 'Contratos',
        settings: 'Configurações'
      },
      guard: {
        disabled: 'O módulo de Aluguel de Motos está disponível apenas para oficinas habilitadas no Reino Unido.'
      },
      dashboard: {
        cards: {
          totalVehicles: { label: 'Frota total' },
          availableVehicles: { label: 'Disponíveis' },
          reservedVehicles: { label: 'Reservadas' },
          maintenanceVehicles: { label: 'Manutenção' },
          vans: { label: 'Vans' }
        },
        scheduleTitle: 'Reservas em andamento',
        emptySchedule: 'Nenhuma reserva ativa'
      },
      fleet: {
        title: 'Frota',
        filters: {
          search: {
            placeholder: 'Buscar por placa ou modelo'
          },
          status: {
            label: 'Status',
            all: 'Todos'
          },
          vehicleType: {
            label: 'Tipo',
            all: 'Todos',
            motorcycle: 'Moto',
            van: 'Van'
          }
        },
        table: {
          plate: 'Placa',
          model: 'Modelo',
          status: 'Status',
          mileage: 'Quilometragem',
          insurance: 'Seguro',
          actions: 'Ações'
        },
        empty: 'Nenhum veículo encontrado',
        actions: {
          refresh: 'Atualizar',
          addVehicle: 'Novo veículo',
          addVehicleSuccess: 'Veículo salvo com sucesso.'
        },
        badge: {
          available: 'Disponível',
          reserved: 'Reservada',
          rented: 'Alugada',
          maintenance: 'Manutenção'
        }
      },
      contracts: {
        title: 'Contratos',
        filters: {
          status: {
            all: 'Todos'
          }
        },
        actions: {
          refresh: 'Atualizar',
          newContract: 'Novo contrato'
        },
        empty: 'Nenhum contrato localizado',
        table: {
          vehicle: 'Veículo',
          customer: 'Cliente',
          period: 'Período',
          status: 'Status',
          deposit: 'Depósito'
        },
        statusLabel: {
          draft: 'Rascunho',
          reserved: 'Reservado',
          active: 'Ativo',
          closed: 'Finalizado',
          cancelled: 'Cancelado'
        },
        wizard: {
          steps: {
            customer: 'Cliente',
            vehicle: 'Veículo',
            review: 'Revisão'
          },
          customer: {
            id: 'Cliente / ID',
            name: 'Nome',
            docs: 'Documentos / notas',
            phone: 'Telefone',
            linkedOrder: 'OS vinculada'
          },
          vehicle: {
            vehicle: 'Selecione o veículo',
            select: 'Escolha uma moto/van',
            start: 'Início',
            end: 'Devolução',
            deposit: 'Depósito (£)',
            notes: 'Observações',
            availability: {
              title: 'Disponibilidade',
              refresh: 'Atualizar',
              loading: 'Carregando...',
              empty: 'Sem conflitos registrados'
            }
          },
          review: {
            title: 'Resumo',
            noDeposit: 'Sem depósito'
          },
          actions: {
            cancel: 'Cancelar',
            previous: 'Voltar',
            next: 'Avançar',
            finish: 'Confirmar contrato',
            saving: 'Salvando...'
          }
        }
      },
      settings: {
        title: 'Configurações do módulo',
        description: 'Os valores padrões são carregados das configurações da instância.',
        rates: {
          title: 'Tarifas padrão',
          daily: 'Diária',
          weekly: 'Semanal',
          deposit: 'Depósito'
        },
        vanNote: 'Vans utilizam o mesmo fluxo de cadastro, apenas alterando o tipo do veículo.'
      }
    },
    'en_US': {
      title: 'Moto & Van Rental',
      subtitle: 'UK workshop-only fleet management for courtesy rentals and paid contracts.',
      tabs: {
        dashboard: 'Dashboard',
        fleet: 'Fleet',
        contracts: 'Contracts',
        settings: 'Settings'
      },
      guard: {
        disabled: 'Moto Rental is available only for UK-enabled workshops.'
      },
      dashboard: {
        cards: {
          totalVehicles: { label: 'Total fleet' },
          availableVehicles: { label: 'Available' },
          reservedVehicles: { label: 'Reserved' },
          maintenanceVehicles: { label: 'Maintenance' },
          vans: { label: 'Vans' }
        },
        scheduleTitle: 'Active reservations',
        emptySchedule: 'No active bookings'
      },
      fleet: {
        title: 'Fleet',
        filters: {
          search: {
            placeholder: 'Search by plate or model'
          },
          status: {
            label: 'Status',
            all: 'All'
          },
          vehicleType: {
            label: 'Type',
            all: 'All',
            motorcycle: 'Motorcycle',
            van: 'Van'
          }
        },
        table: {
          plate: 'Plate',
          model: 'Model',
          status: 'Status',
          mileage: 'Mileage',
          insurance: 'Insurance',
          actions: 'Actions'
        },
        empty: 'No vehicles found',
        actions: {
          refresh: 'Refresh',
          addVehicle: 'New vehicle',
          addVehicleSuccess: 'Vehicle saved successfully.'
        },
        badge: {
          available: 'Available',
          reserved: 'Reserved',
          rented: 'Rented',
          maintenance: 'Maintenance'
        }
      },
      contracts: {
        title: 'Contracts',
        filters: {
          status: {
            all: 'All'
          }
        },
        actions: {
          refresh: 'Refresh',
          newContract: 'New contract'
        },
        empty: 'No contracts found',
        table: {
          vehicle: 'Vehicle',
          customer: 'Customer',
          period: 'Period',
          status: 'Status',
          deposit: 'Deposit'
        },
        statusLabel: {
          draft: 'Draft',
          reserved: 'Reserved',
          active: 'Active',
          closed: 'Closed',
          cancelled: 'Cancelled'
        },
        wizard: {
          steps: {
            customer: 'Customer',
            vehicle: 'Vehicle',
            review: 'Review'
          },
          customer: {
            id: 'Customer / ID',
            name: 'Name',
            docs: 'Documents / notes',
            phone: 'Phone',
            linkedOrder: 'Linked Service Order'
          },
          vehicle: {
            vehicle: 'Select vehicle',
            select: 'Choose a moto/van',
            start: 'Start date',
            end: 'Return date',
            deposit: 'Deposit (£)',
            notes: 'Notes',
            availability: {
              title: 'Availability',
              refresh: 'Refresh',
              loading: 'Loading...',
              empty: 'No conflicts found'
            }
          },
          review: {
            title: 'Summary',
            noDeposit: 'No deposit'
          },
          actions: {
            cancel: 'Cancel',
            previous: 'Back',
            next: 'Next',
            finish: 'Confirm contract',
            saving: 'Saving...'
          }
        }
      },
      settings: {
        title: 'Module settings',
        description: 'Default tariffs are fetched from the instance configuration.',
        rates: {
          title: 'Default rates',
          daily: 'Daily',
          weekly: 'Weekly',
          deposit: 'Deposit'
        },
        vanNote: 'Vans reuse the same forms, just set the vehicle type accordingly.'
      }
    }
  };

  public static get(language?: string) {
    return MotoRentalTranslate.map[language ?? getLanguage()] || MotoRentalTranslate.map['pt_BR'];
  }
}
