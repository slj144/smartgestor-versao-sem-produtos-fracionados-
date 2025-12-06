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

## Extensão para Vans
- **Mesma base de código**: o módulo opera com o campo `vehicleType` (`motorcycle` ou `van`), permitindo compartilhar UI, contratos e integrações sem duplicar regras.
- **Requisitos adicionais**: vans podem ter documentos específicos (ex.: `linkedVanOrderId`, seguro comercial) e tarifas distintas. Essas diferenças devem vir da tabela de tarifas (`MotoRentalRates`) ou de overrides por contrato.
- **Restrições regionais**: mesmo com suporte a vans, o módulo continua liberado apenas quando `workshop.motoRentalEnabled` está ativo para instâncias do Reino Unido, evitando qualquer impacto em clientes do Brasil.
- **Foco diferencial UK**: a oferta para oficinas britânicas inclui combos “Moto + Van courtesy” e alertas de logística levando em conta veículos acima de 3,5 toneladas quando `vehicleType === 'van'`.

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

## Log de Implementação
- **02/12/2025 – Backend scaffolded**: criado o módulo `functions/src/moto-rentals/` com handlers para veículos, contratos, reservas e disponibilidade. O acesso está protegido por `settings.workshop.motoRentalEnabled` + `profile.country === 'UK'`, garantindo zero impacto nos clientes brasileiros.
- **Estrutura de dados**: veículos e contratos agora carregam `vehicleType` (para motos ou vans), histórico de status, vínculo com ordens de serviço/vans e cálculo básico de tarifas (diária/semanal + depósito).
- **Próximos passos**: expor as novas functions no frontend (`MotoRentalModule`), criar componentes reutilizáveis para cadastro de vans e iniciar scripts de migração/seed para `MotoRentalVehicles`, `MotoRentalContracts` e `MotoRentalRates`.
- **02/12/2025 – Frontend scaffolding**: criado o módulo Angular `pages/services/moto-rental/` com guard regional, serviço (`moto-rental.service.ts`) e componentes para Painel, Frota, Contratos e Configurações. A navegação só aparece para instâncias UK com `workshop.motoRentalEnabled`, mantendo clientes brasileiros intactos. O serviço consome as novas cloud functions e cacheia os registros de veículos/contratos para dashboards e futuros formulários (inclusive vans via `vehicleType`).
- **04/12/2025 – CRUD de Frota**: habilitado formulário/modal de veículos no componente de Frota com validação da placa UK, suporte a motos/vans e integração direta com `motoRentalSaveVehicle`. A lista agora permite cadastrar/editar rapidamente status, tarifas (diária/semanal/depósito) e documentos (seguro/road tax), mantendo todo o fluxo protegido pelo guard regional.
- **04/12/2025 – Configuração no Super Admin**: o painel `super-admin` passou a permitir selecionar o país da instância e ativar o flag `workshop.motoRentalEnabled` (exclusivo para Reino Unido) já na criação/edição. Assim conseguimos provisionar oficinas britânicas sem tocar manualmente nos documentos do `Projects`.
- **04/12/2025 – Correção de navegação**: o menu “Aluguel de Motos” agora usa o mesmo caminho (`/servicos/aluguel-de-motos`) independentemente do idioma da instância, evitando redirecionar o usuário para “Ordens de Serviço” quando a UI estiver em inglês.
- **04/12/2025 – Roteamento consolidado**: o path `/:tenant/servicos` passou a carregar `ServicesModule`, permitindo que Service Orders e Moto Rental convivam sob o mesmo menu sem conflitos. O `MotoRentalGuard` também ganhou logs e volta a redirecionar para OS quando o recurso não estiver habilitado.
- **06/12/2025 – Wizard de Contratos**: adicionamos o fluxo guiado para reservas/contratos (cliente → veículo/período → revisão), acionado diretamente na aba “Contratos”. O wizard já consome `reserveVehicle`, exibe conflitos de disponibilidade e reutiliza as tarifas padrão da instância UK.
- **06/12/2025 – Gate reforçado**: o backend agora “hidrata” as configurações da instância direto do `projects-manager` sempre que `country` ou `workshop.motoRentalEnabled` não chegam no payload. Também normalizamos o país a partir de `adminKey/company/profile`, eliminando os erros `MOTO_RENTAL_DISABLED_FOR_INSTANCE`/`MOTO_RENTAL_ALLOWED_ONLY_IN_UK` em tenants já habilitados no Reino Unido.
- **06/12/2025 – Persistência da frota**: ajustamos o `motoRentalSaveVehicle` e `reserveVehicle` para usar `update(..., { upsert: true })`, garantindo que novos veículos e contratos sejam gravados mesmo sem documentos prévios e mantendo compatibilidade com o driver atual.
- **06/12/2025 – Validação de placas**: ampliamos o validador para aceitar padrões prefix/suffix históricos do DVLA e normalizamos qualquer caractere não alfanumérico antes da checagem. Também incluímos um fallback controlado (`[A-Z0-9]{5,8}`) com log para garantir que placas reais não sejam bloqueadas por variações mínimas. O frontend agora exibe o erro retornado (`INVALID_PLATE_FORMAT`) via notification, ajudando o usuário a entender por que o cadastro falhou.
- **06/12/2025 – Correção de listagem**: o serviço Angular deixou de converter `{ status, data }` em um array artificial. Agora ele lê `response.data.data` antes de popular a tabela e mostra o toast verde de sucesso após salvar veículos, garantindo que cadastros recentes apareçam imediatamente na aba “Frota”.
