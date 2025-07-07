// prototipo/js/auth.js

// Asegúrate de que API_BASE_URL, showMessage, showSection, updateUI,
// y las variables del DOM para los formularios y sus inputs estén accesibles globalmente.

// Variable global para el usuario actualmente logueado
//let currentUser = null; // Se establecerá después de un login exitoso

// Elementos del DOM para autenticación y perfil (¡Asegúrate de que estén definidos en tu HTML!)
// const regNameInput = document.getElementById('regName');
// const regLastnameInput = document.getElementById('regLastname');
// const regEmailInput = document.getElementById('regEmail');
// const regPasswordInput = document.getElementById('regPassword');
// const registerForm = document.getElementById('registerForm');

// const loginEmailInput = document.getElementById('loginEmail');
// const loginPasswordInput = document.getElementById('loginPassword');
// const loginForm = document.getElementById('loginForm');

//const editNameInput = document.getElementById('editName');
//const editLastnameInput = document.getElementById('editLastname');
 //const editEmailInput = document.getElementById('editEmail'); // Este campo podría ser solo de lectura
//const editProfileForm = document.getElementById('editProfileForm');

// const currentPasswordInput = document.getElementById('currentPassword');
// const newPasswordInput = document.getElementById('newPassword');
// const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
// const changePasswordForm = document.getElementById('changePasswordForm');

// const homeSection = document.getElementById('homeSection'); // de app.js
// const adminSection = document.getElementById('adminSection'); // de app.js
// const loginSection = document.getElementById('loginSection'); // de app.js
// const registerSection = document.getElementById('registerSection'); // de app.js

// Función para validar la complejidad de la contraseña (REQNF1) - Se mantiene en frontend
const isValidPassword = (password) => {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber;
};

// --- Función para registrar un nuevo usuario (REQ-16, REQ-17) ---
const registerUser = async (e) => { // <-- ¡Marcar como async!
    e.preventDefault();

    const name = regNameInput.value.trim();
    const lastname = regLastnameInput.value.trim();
    const email = regEmailInput.value.trim().toLowerCase();
    const password = regPasswordInput.value;

    if (!name || !lastname || !email || !password) {
        showMessage('Por favor, completa todos los campos.', 'error');
        return;
    }

    // Validar formato de email (frontend)
    if (!/\S+@\S+\.\S+/.test(email)) {
        showMessage('Por favor, introduce un correo electrónico válido.', 'error');
        return;
    }

    // Validar complejidad de la contraseña (REQNF1) (frontend)
    if (!isValidPassword(password)) {
        showMessage('La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.', 'error');
        return;
    }

    // Preparar los datos para enviar al backend
    const userData = {
        name,
        lastname,
        email,
        password // IMPORTANTE: En un sistema real, la contraseña se hashearía en el backend. Aquí la enviamos en claro al backend.
    };

    try {
        // Enviar la petición POST al backend para registrar al usuario
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json(); // Leer la respuesta del backend

        if (response.ok) { // Si la respuesta es exitosa (código 2xx)
            showMessage(result.message || '¡Registro exitoso! Ya puedes iniciar sesión.', 'success');
            registerForm.reset(); // Limpiar formulario
            showSection(loginSection); // Llevar al usuario a la sección de login
            console.log('Usuario registrado. ID:', result.userId);
        } else { // Si hubo un error (código 4xx o 5xx)
            console.error('Error durante el registro:', result);
            if (response.status === 409) { // 409 Conflict para correo ya registrado (REQ-17)
                showMessage(result.message || 'Este correo electrónico ya está registrado.', 'error');
            } else {
                showMessage(result.message || 'Error al registrar el usuario. Inténtalo de nuevo.', 'error');
            }
        }
    } catch (error) {
        console.error('Error de red o desconocido durante el registro:', error);
        showMessage('Ocurrió un error inesperado al registrarte. Verifica tu conexión.', 'error');
    }
};

// --- Función para iniciar sesión (REQ-1) ---
const loginUser = async (e) => { // <-- ¡Marcar como async!
    e.preventDefault();

    const email = loginEmailInput.value.trim().toLowerCase();
    const password = loginPasswordInput.value;

    if (!email || !password) {
        showMessage('Por favor, ingresa tu correo y contraseña.', 'error');
        return;
    }

    // Preparar los datos para enviar al backend
    const credentials = { email, password };

    try {
        // Enviar la petición POST al backend para iniciar sesión
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const result = await response.json(); // Leer la respuesta del backend

        if (response.ok) { // Si la respuesta es exitosa (código 2xx)
            // REQ-1: Establecer el usuario actual con los datos que devuelve el backend
            currentUser = {
                id: result.user.id,
                name: result.user.name,
                lastname: result.user.lastname, // Asumiendo que el backend envía 'lastname'
                email: result.user.email,
                role: result.user.role,
                address: result.user.address, // Si el backend los envía
                phone: result.user.phone      // Si el backend los envía
            };
            showMessage(`Bienvenido, ${currentUser.name}!`, 'success');
            loginForm.reset(); // Limpiar formulario
            updateUI(); // Actualizar la interfaz de usuario (botones, etc.)

            // Redirigir según el rol
            if (currentUser.role === 'admin') {
                showSection(adminSection); // Ir al panel de administración
                await loadAdminData(); // Cargar datos del admin asíncronamente
            } else {
                showSection(homeSection); // Ir a la página de inicio
            }
            console.log('Usuario logueado:', currentUser);
        } else { // Si hubo un error (código 4xx o 5xx)
            console.error('Error durante el login:', result);
            showMessage(result.message || 'Correo electrónico o contraseña incorrectos.', 'error');
            currentUser = null; // Asegurarse de que no hay usuario logueado en caso de fallo
            updateUI(); // Actualizar la UI si el login falla
        }
    } catch (error) {
        console.error('Error de red o desconocido durante el login:', error);
        showMessage('Ocurrió un error inesperado al iniciar sesión. Verifica tu conexión.', 'error');
    }
};

// --- Función para editar el perfil del usuario (REQ-18) ---
const editUserProfile = async (e) => { // <-- ¡Marcar como async!
    e.preventDefault();

    if (!currentUser || !currentUser.id) {
        showMessage('No hay un usuario logueado para editar o su ID no es válido.', 'error');
        return;
    }

    const newName = editNameInput.value.trim();
    const newLastname = editLastnameInput.value.trim();
    const newPhone = editPhoneInput.value.trim(); // Si añades un input de teléfono en el perfil
    const newAddress = editAddressInput.value.trim(); // Si añades un input de dirección en el perfil

    if (!newName || !newLastname) { // Ajusta validación si añades más campos
        showMessage('Nombre y apellido no pueden estar vacíos.', 'error');
        return;
    }

    // Preparar los datos actualizados para enviar al backend
    const updatedProfileData = {
        name: newName,
        lastname: newLastname,
        phone: newPhone, // Asegúrate de que tu backend espera 'phone'
        address: newAddress // Asegúrate de que tu backend espera 'address'
    };

    try {
        // Enviar la petición PUT al backend para actualizar el perfil
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProfileData)
        });

        const result = await response.json();

        if (response.ok) {
            // Actualizar el objeto currentUser localmente con los nuevos datos
            currentUser.name = newName;
            currentUser.lastname = newLastname;
            currentUser.phone = newPhone;
            currentUser.address = newAddress;

            showMessage(result.message || 'Datos de perfil actualizados exitosamente.', 'success');
            updateUI(); // Para actualizar el nombre en el encabezado si aplica
            console.log('Perfil actualizado:', currentUser);
        } else {
            console.error('Error al actualizar el perfil:', result);
            showMessage(result.message || 'Error al actualizar el perfil.', 'error');
        }
    } catch (error) {
        console.error('Error de red o desconocido al actualizar el perfil:', error);
        showMessage('Ocurrió un error inesperado al actualizar tu perfil. Verifica tu conexión.', 'error');
    }
};

// --- Función para cambiar la contraseña (Parte de REQNF1 - seguridad de contraseña) ---
const changeUserPassword = async (e) => { // <-- ¡Marcar como async!
    e.preventDefault();

    if (!currentUser || !currentUser.id) {
        showMessage('No hay un usuario logueado para cambiar la contraseña.', 'error');
        return;
    }

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showMessage('Por favor, completa todos los campos de contraseña.', 'error');
        return;
    }

    // Aquí no verificamos currentPassword === currentUser.password directamente
    // porque currentUser.password NO debe almacenar la contraseña real.
    // Esa verificación la hará el backend.
    
    if (newPassword !== confirmNewPassword) {
        showMessage('La nueva contraseña y su confirmación no coinciden.', 'error');
        return;
    }

    if (!isValidPassword(newPassword)) {
        showMessage('La nueva contraseña no cumple con los requisitos de seguridad.', 'error');
        return;
    }

    // Preparar los datos para enviar al backend
    const passwordData = {
        currentPassword: currentPassword, // El backend verificará si es correcta
        newPassword: newPassword
    };

    try {
        // Enviar la petición PUT al backend para cambiar la contraseña
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(passwordData)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(result.message || 'Contraseña cambiada exitosamente.', 'success');
            changePasswordForm.reset(); // Limpiar formulario
            // No actualizamos currentUser.password aquí, ya que no deberíamos almacenarla.
        } else {
            console.error('Error al cambiar la contraseña:', result);
            showMessage(result.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.', 'error');
        }
    } catch (error) {
        console.error('Error de red o desconocido al cambiar la contraseña:', error);
        showMessage('Ocurrió un error inesperado al cambiar tu contraseña. Verifica tu conexión.', 'error');
    }
};

// Event Listeners para los formularios de autenticación
registerForm.addEventListener('submit', registerUser);
loginForm.addEventListener('submit', loginUser);
editProfileForm.addEventListener('submit', editUserProfile);
changePasswordForm.addEventListener('submit', changeUserPassword);