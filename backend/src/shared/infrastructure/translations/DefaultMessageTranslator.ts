import { MessageTranslator } from 'src/shared/application/protocols/translations/MessageTranslator';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { MessageParams } from 'src/shared/domain/messages/Message';

const PT_BR_MESSAGES: Record<MessageKeyEnum, string> = {
  [MessageKeyEnum.INTERNAL_SERVER_ERROR]:
    'Ocorreu um erro interno. Tente novamente mais tarde.',
  [MessageKeyEnum.RESOURCE_NOT_FOUND]:
    'O recurso solicitado não foi encontrado.',
  [MessageKeyEnum.INVALID_REQUEST]: 'A requisição enviada é inválida.',
  [MessageKeyEnum.MISSING_PARAM]: 'Parâmetro ausente: {param}.',
  [MessageKeyEnum.INVALID_PARAM]: 'Parâmetro inválido: {param}.',
  [MessageKeyEnum.AUTHENTICATION_REQUIRED]:
    'É necessário estar autenticado para continuar.',
  [MessageKeyEnum.ACCESS_DENIED]:
    'Você não possui permissão para acessar este recurso.',
  [MessageKeyEnum.INVALID_SIGN_IN_PAYLOAD]:
    'Informe e-mail, senha e tipo de acesso válidos.',
  [MessageKeyEnum.INVALID_SIGN_UP_PAYLOAD]:
    'Informe e-mail, senha e confirmação de senha válidos.',
  [MessageKeyEnum.INVALID_SIGN_OUT_PAYLOAD]:
    'Não foi possível identificar a sessão a ser encerrada.',
  [MessageKeyEnum.INVALID_EMAIL_OR_PASSWORD]: 'E-mail ou senha inválidos.',
  [MessageKeyEnum.ACCESS_TYPE_NOT_ALLOWED]:
    'Esta conta não possui acesso à área solicitada.',
  [MessageKeyEnum.PASSWORDS_DO_NOT_MATCH]:
    'A senha e a confirmação devem ser iguais.',
  [MessageKeyEnum.PASSWORD_ALREADY_USED]:
    'A nova senha não pode repetir nenhuma das três últimas senhas.',
  [MessageKeyEnum.WEAK_PASSWORD]:
    'A senha deve ter ao menos 8 caracteres, incluindo letra maiúscula, minúscula e caractere especial.',
  [MessageKeyEnum.EMAIL_ALREADY_USED]: 'O e-mail {email} já está cadastrado.',
  [MessageKeyEnum.INVALID_OR_INACTIVE_TOKEN]:
    'A sessão é inválida ou já foi encerrada.',
  [MessageKeyEnum.INVALID_PASSWORD_RECOVERY_TOKEN]:
    'O link de recuperação é inválido ou expirou.',
  [MessageKeyEnum.INVALID_OR_INACTIVE_USER]:
    'O usuário é inválido ou está inativo.',
  [MessageKeyEnum.ENTITY_NOT_FOUND]:
    'A entidade com identificador {id} não foi encontrada.',
  [MessageKeyEnum.DUPLICATE_ENTITY_ID]:
    'Foi encontrada mais de uma entidade com o identificador {id}.',
  [MessageKeyEnum.RESOURCE_CONFLICT]:
    'A operação conflita com o estado atual do recurso.',
};

export class DefaultMessageTranslator implements MessageTranslator {
  public translate(key: MessageKeyEnum, params: MessageParams = {}): string {
    return Object.entries(params).reduce(
      (message, [param, value]) =>
        message.replaceAll(`{${param}}`, String(value)),
      PT_BR_MESSAGES[key],
    );
  }
}
