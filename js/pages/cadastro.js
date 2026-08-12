import { Stepper } from "../components/stepper.js";
import { attachMask, maskTelefone, maskCep, maskUf } from "../utils/masks.js";
import {
  validNome,
  validEmail,
  validTelefone,
  validCep,
  validUf,
  validSenha,
  validConfirmaSenha,
  required,
  validateFields,
} from "../utils/validators.js";
import { buscarEnderecoPorCep } from "../services/cepService.js";
import { signUp } from "../services/authService.js";
import { setToken } from "../utils/session.js";
const form = document.getElementById("cadastro-form");
const btnAvancar = document.getElementById("btn-avancar");
const btnVoltar = document.getElementById("btn-voltar");
const statusRegion = document.getElementById("cadastro-status");
const feedback = document.getElementById("cadastro-feedback");

const fields = {
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  telefone: document.getElementById("telefone"),
  senha: document.getElementById("senha"),
  "confirmar-senha": document.getElementById("confirmar-senha"),
  cep: document.getElementById("cep"),
  uf: document.getElementById("uf"),
  cidade: document.getElementById("cidade"),
  numero: document.getElementById("numero"),
  bairro: document.getElementById("bairro"),
  rua: document.getElementById("rua"),
};

const toggleSenha = document.getElementById("toggle-senha");
const toggleConfirmarSenha = document.getElementById(
  "toggle-confirmar-senha"
);

toggleSenha.addEventListener("click", () => {
  const isVisible = fields.senha.type === "text";

  fields.senha.type = isVisible ? "password" : "text";

  toggleSenha.setAttribute("aria-pressed", String(!isVisible));

  toggleSenha.setAttribute(
    "aria-label",
    isVisible ? "Mostrar senha" : "Ocultar senha"
  );
});

toggleConfirmarSenha.addEventListener("click", () => {
  const isVisible = fields["confirmar-senha"].type === "text";

  fields["confirmar-senha"].type = isVisible ? "password" : "text";

  toggleConfirmarSenha.setAttribute(
    "aria-pressed",
    String(!isVisible)
  );

  toggleConfirmarSenha.setAttribute(
    "aria-label",
    isVisible ? "Mostrar senha" : "Ocultar senha"
  );
});

const STEP_RULES = [
  { nome: validNome, email: validEmail, telefone: validTelefone, senha: validSenha,"confirmar-senha": (v) => validConfirmaSenha(v, fields.senha.value), },
  {
    cep: validCep,
    uf: validUf,
    cidade: (v) => required(v, "Informe a cidade."),
    numero: (v) => required(v, "Informe o número."),
    bairro: (v) => required(v, "Informe o bairro."),
    rua: (v) => required(v, "Informe a rua."),
  },
];

const stepper = new Stepper({
  steps: [document.getElementById("step-0"), document.getElementById("step-1")],
  indicators: Array.from(document.querySelectorAll(".stepper__item")),
  liveRegion: statusRegion,
  announce: (current, total) => `Etapa ${current} de ${total}.`,
});

attachMask(fields.telefone, maskTelefone);
attachMask(fields.cep, maskCep);
attachMask(fields.uf, maskUf);

function currentStepValues() {
  const values = {};
  for (const key of Object.keys(fields)) values[key] = fields[key].value;
  return values;
}

function clearErrors(stepIndex) {
  for (const field of Object.keys(STEP_RULES[stepIndex])) {
    fields[field].removeAttribute("aria-invalid");
    const errorEl = document.getElementById(`${field}-erro`);
    if (errorEl) errorEl.textContent = "";
  }
}

function showErrors(errors) {
  let firstInvalid = null;
  for (const [field, message] of Object.entries(errors)) {
    fields[field].setAttribute("aria-invalid", "true");
    const errorEl = document.getElementById(`${field}-erro`);
    if (errorEl) errorEl.textContent = message;
    if (!firstInvalid) firstInvalid = fields[field];
  }
  firstInvalid?.focus();
}

function validateCurrentStep() {
  const stepIndex = stepper.current;
  clearErrors(stepIndex);
  const errors = validateFields(currentStepValues(), STEP_RULES[stepIndex]);
  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return false;
  }
  return true;
}

function syncActionsWithStep() {
  btnVoltar.hidden = stepper.isFirst;
  btnAvancar.textContent = stepper.isLast ? "Concluir cadastro" : "Avançar";
}

// Autopreenchimento de endereço a partir do CEP.
fields.cep.addEventListener("blur", async () => {
  const digits = fields.cep.value.replace(/\D/g, "");
  if (digits.length !== 8) return;

  fields.cep.setAttribute("aria-busy", "true");
  try {
    const endereco = await buscarEnderecoPorCep(fields.cep.value);
    if (!endereco) {
      fields.cep.setAttribute("aria-invalid", "true");
      document.getElementById("cep-erro").textContent =
        "CEP não encontrado. Confira e tente novamente.";
      return;
    }
    fields.uf.value = endereco.uf;
    fields.cidade.value = endereco.cidade;
    fields.bairro.value = endereco.bairro;
    fields.rua.value = endereco.rua;
    fields.numero.focus();
  } catch (error) {
    // Falha de rede não deve travar o preenchimento manual do endereço.
    console.warn("Falha ao consultar o CEP:", error);
  } finally {
    fields.cep.removeAttribute("aria-busy");
  }
});

btnVoltar.addEventListener("click", () => {
  stepper.goBack();
  syncActionsWithStep();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateCurrentStep()) return;

  if (!stepper.isLast) {
    stepper.goNext();
    syncActionsWithStep();
    return;
  }

  submitCadastro(currentStepValues());
});

async function submitCadastro(values) {
  feedback.textContent = "";
  btnAvancar.disabled = true;
  statusRegion.textContent = "Enviando cadastro...";

  const payload = {
    nome: values.nome.trim(),
    telefone: values.telefone.replace(/\D/g, ""),
    email: values.email.trim(),
    senha: values.senha,
    address: {
      cep: values.cep.trim(),
      rua: values.rua.trim(),
      numero: values.numero.trim(),
      cidade: values.cidade.trim(),
      estado: values.uf.trim().toUpperCase(),
    },
  };

  try {
    const { token } = await signUp(payload);

    setToken(token);

    statusRegion.textContent = "Cadastro concluído com sucesso!";

    window.location.href = "../index-logado.html";
  } catch (error) {
    feedback.textContent = error.message;
    statusRegion.textContent = "Não foi possível concluir o cadastro.";
    btnAvancar.disabled = false;
  }
}

syncActionsWithStep();
