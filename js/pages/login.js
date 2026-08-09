import { login } from "../services/authService.js";
import { setToken, clearToken } from "../utils/session.js";

(() => {
  "use strict";
 
  const form = document.getElementById("login-form");
  const feedback = document.getElementById("form-feedback");
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("email-error");
  const passwordInput = document.getElementById("password");
  const passwordError = document.getElementById("password-error");
  const toggleBtn = document.getElementById("toggle-password");
 
  /**
   * Alterna a visibilidade da senha e mantém o botão com o
   * estado (aria-pressed) e o rótulo corretos para leitores de tela.
   */
  toggleBtn.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
 
    passwordInput.type = isVisible ? "password" : "text";
    toggleBtn.setAttribute("aria-pressed", String(!isVisible));
    toggleBtn.setAttribute(
      "aria-label",
      isVisible ? "Mostrar senha" : "Ocultar senha"
    );
  });
 
  function setFieldError(input, errorEl, message) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
  }
 
  function validate() {
    let firstInvalid = null;
    const errors = [];
 
    if (!emailInput.value.trim()) {
      setFieldError(emailInput, emailError, "Informe seu e-mail.");
      errors.push("e-mail");
      firstInvalid = firstInvalid || emailInput;
    } else if (!emailInput.validity.valid) {
      setFieldError(emailInput, emailError, "Informe um e-mail válido.");
      errors.push("e-mail");
      firstInvalid = firstInvalid || emailInput;
    } else {
      setFieldError(emailInput, emailError, "");
    }
 
    if (!passwordInput.value) {
      setFieldError(passwordInput, passwordError, "Informe sua senha.");
      errors.push("senha");
      firstInvalid = firstInvalid || passwordInput;
    } else {
      setFieldError(passwordInput, passwordError, "");
    }
 
    if (errors.length > 0) {
      feedback.textContent =
        "Corrija os seguintes campos antes de continuar: " +
        errors.join(", ") +
        ".";
      firstInvalid.focus();
      return false;
    }
 
    feedback.textContent = "";
    return true;
  }
 
  const submitBtn = form.querySelector("button[type=submit]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
 
    if (!validate()) {
      return;
    }

    submitBtn.disabled=true;
    feedback.textContent = "";

    try{

      clearToken();
      
      const{ token } = await login(
        emailInput.value.trim(),
        passwordInput.value
      );

      setToken(token);
      window.location.href = "../index.html";
    } catch(error){
      console.error("Erro no login:", error);
      feedback.textContent = error.message;
      submitBtn.disabled = false;
    }
  });
})();