document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const output = document.getElementById('form-output');
  const successPopup = document.getElementById('form-success');
  const submitBtn = form ? document.getElementById('submit-btn') : null;

  if (!form || !output || !submitBtn) return;

  // Visi laukai
  const fields = {
    firstName: form.querySelector('#first-name'),
    lastName: form.querySelector('#last-name'),
    email: form.querySelector('#email'),
    phone: form.querySelector('#phone'),
    address: form.querySelector('#address'),
    q1: form.querySelector('#q1'),
    q2: form.querySelector('#q2'),
    q3: form.querySelector('#q3'),
    message: form.querySelector('#message'),
  };

  /* ===== Pagalbinės funkcijos klaidoms ===== */

  function showError(input, message) {
    const field = input.closest('.field');
    if (!field) return;

    let error = field.querySelector('.error-text');
    if (!error) {
      error = document.createElement('span');
      error.className = 'error-text';
      field.appendChild(error);
    }
    error.textContent = message;
    input.classList.add('has-error');
  }

  function clearError(input) {
    const field = input.closest('.field');
    if (!field) return;

    const error = field.querySelector('.error-text');
    if (error) error.textContent = '';
    input.classList.remove('has-error');
  }

  /* ===== 1. Validacija realiu laiku (išskyrus telefoną) ===== */
  // silent = true -> tikrinti, bet nerodyti klaidų (naudojama mygtukui)

  function validateFirstName(silent) {
    const value = fields.firstName.value.trim();
    let msg = '';

    if (!value) msg = 'Įveskite vardą';
    else if (!/^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\- ]+$/.test(value))
      msg = 'Vardas turi būti sudarytas tik iš raidžių';

    if (!silent) {
      msg ? showError(fields.firstName, msg) : clearError(fields.firstName);
    }
    return !msg;
  }

  function validateLastName(silent) {
    const value = fields.lastName.value.trim();
    let msg = '';

    if (!value) msg = 'Įveskite pavardę';
    else if (!/^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\- ]+$/.test(value))
      msg = 'Pavardė turi būti sudaryta tik iš raidžių';

    if (!silent) {
      msg ? showError(fields.lastName, msg) : clearError(fields.lastName);
    }
    return !msg;
  }

  function validateEmail(silent) {
    const value = fields.email.value.trim();
    let msg = '';

    if (!value) msg = 'Įveskite el. paštą';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      msg = 'Neteisingas el. pašto formatas';

    if (!silent) {
      msg ? showError(fields.email, msg) : clearError(fields.email);
    }
    return !msg;
  }

  function validateAddress(silent) {
    const value = fields.address.value.trim();
    let msg = '';

    if (!value) msg = 'Įveskite adresą (tekstą)';

    if (!silent) {
      msg ? showError(fields.address, msg) : clearError(fields.address);
    }
    return !msg;
  }

  function validateRating(input, silent, label) {
    const value = input.value.trim();
    let msg = '';

    if (!value) msg = `Įveskite įvertinimą (${label})`;
    else {
      const num = Number(value);
      if (Number.isNaN(num) || num < 1 || num > 10) {
        msg = 'Įvertinimas turi būti nuo 1 iki 10';
      }
    }

    if (!silent) {
      msg ? showError(input, msg) : clearError(input);
    }
    return !msg;
  }

  function validateMessage(silent) {
    const value = fields.message.value.trim();
    let msg = '';

    if (!value) msg = 'Įrašykite žinutę';

    if (!silent) {
      msg ? showError(fields.message, msg) : clearError(fields.message);
    }
    return !msg;
  }

  /* ===== 2. Telefonas: formatavimas + tikrinimas ===== */

  function formatPhoneValue(input) {
    // paliekam tik skaitmenis
    let digits = input.value.replace(/\D/g, '');

    // jei įveda "8..." – konvertuojam į "3706..."
    if (digits.startsWith('86')) {
      digits = '3706' + digits.slice(2);
    }

    // ribojam iki 11 skaitmenų (370 + 6 + 7 skaitmenys)
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    let formatted = '+';

    if (digits.length <= 3) {
      formatted += digits; // +370
    } else if (digits.length <= 6) {
      formatted += digits.slice(0, 3) + ' ' + digits.slice(3); // +370 6xx
    } else {
      formatted +=
        digits.slice(0, 3) +
        ' ' +
        digits.slice(3, 6) +
        ' ' +
        digits.slice(6); // +370 6xx xxxx
    }

    input.value = formatted;
    return digits;
  }

  function validatePhone(silent) {
    const digits = formatPhoneValue(fields.phone);
    let msg = '';

    if (!digits) {
      msg = 'Įveskite telefono numerį';
    } else if (!/^3706[0-9]{7}$/.test(digits)) {
      msg = 'Numeris turi būti formatu +370 6xx xxxx';
    }

    if (!silent) {
      msg ? showError(fields.phone, msg) : clearError(fields.phone);
    }
    return !msg;
  }

  /* ===== Bendra validacija ir mygtuko būklė ===== */

  function validateAll(silent) {
    let ok = true;
    ok = validateFirstName(silent) && ok;
    ok = validateLastName(silent) && ok;
    ok = validateEmail(silent) && ok;
    ok = validateAddress(silent) && ok;
    ok = validateRating(fields.q1, silent, 'programavimo žinios') && ok;
    ok = validateRating(fields.q2, silent, 'darbas komandoje') && ok;
    ok = validateRating(fields.q3, silent, 'motyvacija') && ok;
    ok = validateMessage(silent) && ok;
    ok = validatePhone(silent) && ok;
    return ok;
  }

  function updateSubmitState() {
    // tikrinam "tyliai" – be klaidų rodymo
    submitBtn.disabled = !validateAll(true);
  }

  // Iš karto disablinam mygtuką, kol forma tuščia
  submitBtn.disabled = true;

  /* ===== Event listeneriai realiai laikui ===== */

  fields.firstName.addEventListener('input', function () {
    validateFirstName(false);
    updateSubmitState();
  });

  fields.lastName.addEventListener('input', function () {
    validateLastName(false);
    updateSubmitState();
  });

  fields.email.addEventListener('input', function () {
    validateEmail(false);
    updateSubmitState();
  });

  fields.address.addEventListener('input', function () {
    validateAddress(false);
    updateSubmitState();
  });

  [fields.q1, fields.q2, fields.q3].forEach(function (el) {
    el.addEventListener('input', function () {
      validateRating(el, false, '');
      updateSubmitState();
    });
  });

  fields.message.addEventListener('input', function () {
    validateMessage(false);
    updateSubmitState();
  });

  fields.phone.addEventListener('input', function () {
    // formatuojam ir tikrinam realiu laiku
    validatePhone(false);
    updateSubmitState();
  });

  /* ===== 4 užduotis + vidurkis + sėkmės pranešimas ===== */

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // pilnas validacijos patikrinimas su klaidomis
    const isValid = validateAll(false);
    if (!isValid) {
      updateSubmitState();
      return;
    }

    const formData = {
      firstName: fields.firstName.value.trim(),
      lastName: fields.lastName.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      address: fields.address.value.trim(),
      ratingProgramming: fields.q1.value.trim(),
      ratingTeamwork: fields.q2.value.trim(),
      ratingMotivation: fields.q3.value.trim(),
      message: fields.message.value.trim(),
    };

    console.log('Kontaktų formos duomenys:', formData);

    const avg =
      (Number(formData.ratingProgramming) +
        Number(formData.ratingTeamwork) +
        Number(formData.ratingMotivation)) /
      3;

    // 4 + 5 užduočių atvaizdavimas
    output.innerHTML = `
      <p><strong>Vardas:</strong> ${formData.firstName}</p>
      <p><strong>Pavardė:</strong> ${formData.lastName}</p>
      <p><strong>El. paštas:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
      <p><strong>Tel. numeris:</strong> ${formData.phone}</p>
      <p><strong>Adresas:</strong> ${formData.address}</p>
      <p><strong>Programavimo žinios (1–10):</strong> ${formData.ratingProgramming}</p>
      <p><strong>Darbas komandoje (1–10):</strong> ${formData.ratingTeamwork}</p>
      <p><strong>Motyvacija mokytis (1–10):</strong> ${formData.ratingMotivation}</p>
      <p><strong>Žinutė:</strong> ${formData.message}</p>
      <p><strong>Vidurkis:</strong> ${avg.toFixed(1)}</p>
    `;

    // Sėkmingo pateikimo pranešimas (6 užduotis)
    if (successPopup) {
      successPopup.classList.add('show');
      setTimeout(function () {
        successPopup.classList.remove('show');
      }, 3000);
    }

    // Po sėkmingo pateikimo vėl užblokuojam mygtuką, kol neįves naujų duomenų
    // (formos nenuresetinu, kad matytų ką suvedė – jei nori, gali pridėti form.reset())
    updateSubmitState();
  });

  // pradinė mygtuko būsena
  updateSubmitState();
});

