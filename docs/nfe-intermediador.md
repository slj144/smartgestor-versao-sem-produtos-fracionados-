# Indicador de Intermediador (NF-e)

## Contexto
- A NT 2023.001/2023.002 tornou obrigatório o envio do campo `pag.indIntermed` a partir de 01/09/2024.
- Quando o campo não está presente, a Sefaz retorna a rejeição **“NF-e sem indicativo do intermediador”**.
- Mesmo em operações sem marketplace devemos informar `0`; para marketplace o valor deve ser `1` com os dados em `infIntermed`.

## Ajuste no SmartGestor
- Atualizamos o fluxo de emissão para sempre definir `response.intermediador = parseInt(settingsData.intermediador) || 0` nas NF-e/NFC-e.
- O valor continua vindo da configuração `Configurações > Fiscal > Intermediador`, preservando o comportamento anterior (lojas sem marketplace seguem enviando `0`).
- O código que prepara o payload fica em `hosting/src/app/pages/fiscal/components/modal/components/register/register.component.ts:1086`.

## Observações
- Se a operação utilizar marketplace, mantenha `settingsData.intermediador = 1` e preencha os dados adicionais exigidos pelo fisco.
- O campo permanece opcional na UI, mas agora a API garante o envio do indicador conforme exigido pela Sefaz.
