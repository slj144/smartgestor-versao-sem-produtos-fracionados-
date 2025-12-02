# Moto Rental – Plano para Oficinas no Reino Unido

## Pesquisa sobre placas de motos no Reino Unido
- **Formato atual (desde 2001):** `LLNN LLL`, onde os dois primeiros caracteres identificam a região (DVLA local office), os dois dígitos representam o semestre/ano do registro (`24` = março-agosto/2024; `74` = setembro/2024-março/2025) e os três últimos são aleatórios.
- **Compatibilidade retroativa:** motos registradas antes de 2001 ainda podem usar os esquemas prefix (1983–2001, ex.: `A123 ABC`) ou suffix (1963–1980, ex.: `ABC 123A`), mas novos emplacamentos devem seguir o padrão 2001.
- **Cores e posicionamento:** placa traseira obrigatória com fundo amarelo e caracteres pretos; a dianteira é opcional para motos desde 1975. O caractere deve usar a fonte oficial `Charles Wright` (caracteres em uppercase, sem serifas).
- **Dimensões usuais:** placas de motos usam o formato reduzido 9x7" (228×178 mm), mantendo margens mínimas de 11 mm e espaçamento oficial (11 mm entre caracteres, 33 mm antes/depois do espaço central).
- **Restrições:** apenas letras (`A-Z`) e números (`0-9`), sem substituições estilizadas; proibido alterar espaçamento para formar palavras. Necessário refletir a placa conforme documentação oficial (DVLA) em documentos, checklists e etiquetas.

## Objetivo do novo menu
Criar um módulo de **Aluguel de Motos** voltado para oficinas e lojas britânicas, permitindo controlar frota própria, disponibilidade, contratos e cobranças sem impactar clientes brasileiros.

## Requisitos funcionais
1. **Inventário dedicado** com dados específicos (placa UK, modelo, estado, quilometragem, valor caução, seguro).
2. **Agenda de reservas** (datas, status, link para ordem de serviço quando a moto servir como cortesia).
3. **Contratos digitais** com checklist de entrega/devolução e captura de documentos (drive license, proof of address).
4. **Regras financeiras**: tarifas diárias/semanais, cálculo automático de depósito/danos, integração opcional com módulo Financeiro.
5. **Relatórios**: ocupação da frota, receita por período, alertas de manutenção/road tax/insurance.

## Requisitos não funcionais
- Disponível apenas quando `settings.workshop.motoRentalEnabled === true` e `settings.profile.country === 'UK'` (ou outro critério regional).
- Deve respeitar padrões de autenticação/autorização existentes (roles Mechanics/Manager).
- Dados armazenados em coleções próprias mantendo `instanceId` como partição.

## Arquitetura e dados sugeridos
### Novas coleções iTools
- `MotoRentalVehicles`
  - `id`, `instanceId`, `plate`, `vin`, `make`, `model`, `year`, `status` (`available`, `maintenance`, `rented`), `mileage`, `insuranceExpiry`, `roadTaxExpiry`, `dailyRate`, `weeklyRate`, `deposit`, `notes`.
- `MotoRentalContracts`
  - `id`, `instanceId`, `vehicleId`, `customerId`, `customerDocs`, `startDate`, `endDate`, `status`, `kmOut`, `kmIn`, `damageReport`, `deposit`, `charges`, `linkedServiceOrderId`, `signatures`.
- `MotoRentalRates`
  - Tabelas rápidas por tipo de cliente/plano (corporate, courtesy, paid).

### Funções backend
- Criar pasta `functions/src/moto-rentals/` com handlers:
  - `listVehicles`, `saveVehicle`, `changeVehicleStatus`.
  - `listContracts`, `reserveVehicle`, `closeContract` (calcula valores e atualiza estoque/financeiro).
  - `getAvailability` (consulta veículo + contratos sobrepostos).
- Reutilizar `Functions.parseRequestBody` + `Functions.initITools`. Validar placa com regex conforme padrão UK (`^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$`).
- Hooks para log contábil (gerar movimento em `CashierSales` ou equivalente) quando um contrato pago é fechado.

## Frontend (Angular)
1. **Roteamento/navegação**
   - Novo item “Aluguel de Motos” dentro de `Services` ou `Workshop`.
   - Lazy module `MotoRentalModule` em `pages/services/moto-rental`.
2. **Telas principais**
   - **Dashboard**: cards (motos disponíveis, em uso, manutenção), calendário simples com reservas.
   - **Frota**: CRUD de veículos, validação da placa UK, upload de documentos (seguro, logbook).
   - **Contratos**: wizard (cliente → veículo → termos → assinatura/checklist). Permitir anexar fotos de danos.
   - **Configurações**: definir tarifas padrão, depósitos, templates de contrato, checklists.
3. **Componentes de apoio**
   - Selector reutilizável para motos (similar ao `vehicles selector`).
   - Checklist reutilizando componentes do módulo de Service Orders.
   - Impressão/exportação (PDF/Email) com placa formatada.

## Integrações e compatibilidade
- Sincronizar clientes com o cadastro existente (`Customers`).
- Opcional: vínculo com OS (p.ex. aluguel gratuito enquanto a moto do cliente está na oficina).
- Financeiro: integrar com `CashierSales` ou `AccountsReceivable` para lançamentos automáticos.
- Notificações (email/SMS) para lembretes de devolução ou expiração de seguro.

## Configuração por instância
Adicionar em `Settings/workshop`:
```json
{
  "motoRentalEnabled": true,
  "defaultRates": {
    "daily": 55,
    "weekly": 300,
    "deposit": 250
  }
}
```
- Cachear em `localStorage` junto com demais configurações da instância.
- UI para habilitar/desabilitar disponível apenas para perfis master.

## Testes e rollout
1. **Migração**: script para criar coleções vazias e seeds de configurações nas instâncias UK.
2. **Testes unitários**: validators de placa, cálculo de tarifas e regras de disponibilidade.
3. **Testes e2e**: fluxo completo (cadastro veículo → reserva → fechamento com cobrança).
4. **Piloto**: ativar para 1–2 oficinas no Reino Unido antes do rollout geral.
5. **Docs/treinamento**: atualizar guia de oficinas e release notes destacando exclusividade por região.
