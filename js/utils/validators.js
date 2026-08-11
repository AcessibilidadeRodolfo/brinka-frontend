
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function required(value, mensagem = "Este campo é obrigatório.") {
  return value.trim().length > 0 ? null : mensagem;
}

export function validNome(value) {
  if (!value.trim()) return "Informe seu nome.";
  if (value.trim().length < 3) return "Informe o nome completo.";
  return null;
}

export function validEmail(value) {
  if (!value.trim()) return "Informe seu e-mail.";
  if (!EMAIL_REGEX.test(value.trim())) return "Informe um e-mail válido.";
  return null;
}

export function validTelefone(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Informe seu telefone.";
  if (digits.length < 10) return "Informe um telefone válido, com DDD.";
  return null;
}

export function validCep(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Informe o CEP.";
  if (digits.length !== 8) return "O CEP deve ter 8 dígitos.";
  return null;
}

export function validUf(value) {
  if (!value.trim()) return "UF";
  if (value.trim().length !== 2) return "UF inválida.";
  return null;
}

/**
 * 
 * @param {Record<string, string>} values
 * @param {Record<string, (v: string) => string | null>} rules
 * @returns {Record<string, string>} mapa de erros (vazio se tudo válido)
 */
export function validateFields(values, rules) {
  const errors = {};
  for (const field of Object.keys(rules)) {
    const message = rules[field](values[field] ?? "");
    if (message) errors[field] = message;
  }
  return errors;
}


export function validSenha(value){
  if(!value) return "Informe uma senha.";
  if(value.length <8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Z]/.test(value)) return "A senha deve conter ao menos uma letra maiúscula.";
  if (!/[a-z]/.test(value)) return "A senha deve conter ao menos uma letra minúscula.";
  if (!/\d/.test(value)) return "A senha deve conter ao menos um número.";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
    return "A senha deve conter ao menos um caractere especial.";
  }
  return null;
}

export function validConfirmaSenha(value, senha){
  if(!value) return "Confirme sua senha.";
  if(value !== senha) return "As senhas não coincidem.";
  return null;
}