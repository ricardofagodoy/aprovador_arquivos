const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

const TRIGGER_INTERVAL_MINUTES = 5
const MAIN_SHEET = "Aprovador"

const FOLDER_NAMES = {
  'Input': 'Entrada',
  'Allow': 'Aprovados',
  'Deny': 'Reprovados'
}

const NAMED_RANGES = {
  configs: 'Configs',
  aprovador: 'Aprovador'
}

const MESSAGES = {
  newFileSubject: '[Aprovador] Novo arquivo para aprovação: $NAME',
  newFileBody: 'Você tem um novo arquivo para aprovar, acesse o Aprovador de Arquivos para visualizar.',

  approvedSubject: '[Aprovador] Arquivo aprovado disponível: $NAME',
  approvedBody: 'Seu arquivo foi aprovado, acesse em $LINK',

  rejectedSubject: '[Aprovador] Arquivo rejeitado: $NAME',
  rejectedBody: 'Seu arquivo foi rejeitado por "$MESSAGE", acesse em $LINK'
}

const FILE_DATA = {
  range: 'A$:G$',
  topRow: 6,
  fields: {
    config: 1,
    fileId: 2,
    link: 3,
    owner: 4,
    message: 5,
    status: 6,
  }
}