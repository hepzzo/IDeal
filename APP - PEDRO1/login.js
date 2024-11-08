// Lidar com o login com e-mail e senha
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Redireciona para a página de menu após login
            window.location.href = 'menu.html';
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage); // Mostra o erro para o usuário
        });
});

// Lidar com o login anônimo
document.getElementById('anonymous-login').addEventListener('click', function(e) {
    e.preventDefault();

    firebase.auth().signInAnonymously()
        .then((userCredential) => {
            // Redireciona para a página de menu após login anônimo
            window.location.href = 'menu.html';
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage); // Mostra o erro para o usuário
        });
});

// Lidar com o registro de novo usuário
document.getElementById('register-button').addEventListener('click', function(e) {
    e.preventDefault();

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Registro bem-sucedido
            alert("Usuário registrado com sucesso!");
            window.location.href = 'menu.html'; // Redireciona para a página de menu após registro
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage); // Mostra o erro para o usuário
        });
});

// Lógica para revelar o botão de login anônimo ao digitar "projeto"
let typedKeys = '';
document.addEventListener('keypress', function(e) {
    typedKeys += e.key.toLowerCase();
    if (typedKeys.includes('projeto')) {
        document.getElementById('anonymous-login').classList.remove('hidden');
    }
});

// Selecionar os elementos necessários
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('toggle-password');

// Definir as URLs das imagens de olho aberto e fechado
const eyeOpenIcon = 'eye-open.png'; // Altere para o caminho da sua imagem de olho aberto
const eyeClosedIcon = 'eye-closed.png'; // Altere para o caminho da sua imagem de olho fechado

// Inicializar o ícone de olho
togglePassword.style.backgroundImage = `url(${eyeClosedIcon})`;

// Função para alternar a visibilidade da senha
togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;

    // Alterar o ícone do olho
    togglePassword.style.backgroundImage = type === 'password' ? `url(${eyeClosedIcon})` : `url(${eyeOpenIcon})`;
});
