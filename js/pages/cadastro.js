
import { Stepper } from "../components/stepper.js";
import { attachMask, maskTelefone, maskCep, maskUf } from "../utils/masks.js";
import {
  validNome,
  validEmail,
  validTelefone,
  validCep,
  validUf,
  required,
  validateFields,
} from "../utils/validators.js";
import { buscarEnderecoPorCep } from "../services/cepService.js";

const form = document.getElementById("cadastro-form");
const btnAvancar = document.getElementById("btn-avancar");
const btnVoltar = document.getElementById("btn-voltar");
const statusRegion = document.getElementById("cadastro-status");

const fields = {
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  telefone: document.getElementById("telefone"),
  cep: document.getElementById("cep"),
  uf: document.getElementById("uf"),
  cidade: document.getElementById("cidade"),
  numero: document.getElementById("numero"),
  bairro: document.getElementById("bairro"),
  rua: document.getElementById("rua"),
};

const STEP_RULES = [
  { nome: validNome, email: validEmail, telefone: validTelefone },
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

function submitCadastro(values) {

  btnAvancar.disabled = true;
  statusRegion.textContent = "Enviando cadastro...";

  console.info("Cadastro pronto para envio:", values);

  window.setTimeout(() => {
    statusRegion.textContent = "Cadastro concluído com sucesso!";
    btnAvancar.disabled = false;

  }, 600);
}

syncActionsWithStep();
