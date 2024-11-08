function addHashAndValidateID(input) {            
    input.value = input.value.replace(/\D/g, ''); // remove caracteres que nao sao int
}

function formatDiameter(input) {
    // Se o valor do input estiver vazio, define o placeholder
    if (input.value === '') {
        input.placeholder = 'Digite o diâmetro';
        return;
    }

    // Remove todos os caracteres que não são dígitos ou vírgulas
    let value = input.value.replace(/[^\d,]/g, '');

    // Se não houver vírgula, adiciona ",00" ao final
    if (!value.includes(',')) {
        value += ',00';
    } else {
        let parts = value.split(',');
        if (parts[1].length > 2) {
            // Limita a 2 casas decimais
            parts[1] = parts[1].substring(0, 2);
        } else if (parts[1].length === 0) {
            // Se não houver casas decimais, adiciona '00'
            parts[1] = '00';
        } else if (parts[1].length === 1) {
            // Se houver apenas uma casa decimal, adiciona '0'
            parts[1] += '0';
        }
        // Reúne as partes do valor
        value = parts.join(',');
    }

    

    // Define o valor formatado no input
    input.value = value;
}


function formatLength(input) {
    if (input.value === '') {
        input.placeholder = 'Digite o comprimento';
        return;
    }
    let value = input.value.replace(/[^\d,]/g, ''); // Remove caracteres não numéricos e não vírgulas
    if (!value.includes(',')) {
        value += ',00';
    } else {
        let parts = value.split(',');
        if (parts[1].length > 2) {
            parts[1] = parts[1].substring(0, 2); // Limita a 2 casas decimais
        } else if (parts[1].length === 0) {
            parts[1] = '00';
        } else if (parts[1].length === 1) {
            parts[1] += '0';
        }
        value = parts.join(',');
    }
    if (value && !value.endsWith('mm')) {
        value += 'mm';
    }
    input.value = value;
}

function clearFormat(input, placeholder) {
    if (input.value === '') {
        input.placeholder = placeholder;
    }
}

// Inicialize o Firebase (já feito no HTML)
// Referência ao banco de dados
const db = firebase.database();

// Função para abrir modais
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('closed'); // Remover a classe de fechamento
        modal.style.display = 'block';
        window.location.hash = modalId; // Adicionar hash à URL
    }
}

// Função para fechar modais e resetar a seleção
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('closed'); // Adicionar a classe de fechamento
        setTimeout(() => {
            modal.style.display = 'none';
            resetModal(modalId); // Reseta o modal apenas depois que ele é fechado
        }, 300); // Espera 300ms antes de definir o display para none
        if (window.location.hash === '#' + modalId) {
            history.replaceState(null, null, ' '); // Substituir o hash
        }
    }
}

// Função para validar o formulário antes de adicionar uma broca
function validarFormulario() {
    const id = document.getElementById('id').value.trim();
    const diametro = document.getElementById('diameter').value.trim();
    const comprimento = document.getElementById('length').value.trim();
    const tipo = document.getElementById('type').value.trim();
    const quantidade = document.getElementById('quantity').value.trim();

    if (id && diametro && comprimento && tipo && quantidade) {
        return true; // Todos os campos obrigatórios estão preenchidos
    } else {
        alert('Por favor, preencha todos os campos obrigatórios antes de adicionar a broca.');
        return false; // Existem campos obrigatórios vazios
    }
}

// Função para adicionar uma nova broca ao banco de dados
function adicionarBroca(event) {
    event.preventDefault(); // Evitar o envio padrão do formulário
    if (!validarFormulario()) {
        return; // Se a validação falhar, não prossiga
    }
    let id = document.getElementById('id').value; // Mantenha o ID sem #
    const diametro = document.getElementById('diameter').value.replace('Ø', '').replace('mm', '');
    const comprimento = document.getElementById('length').value.replace('mm', '');
    const IDsuucessor = document.getElementById('IDsuucessor').value || null; // Pode ser vazio
    const comprimentoSucessor = document.getElementById('successor-length').value.replace('mm', '') || null; // Pode ser vazio
    const tipo = document.getElementById('type').value;
    const quantidade = document.getElementById('quantity').value;
    const numeroAfiacoes = 0; // Inicializa com 0

    // Adicionar dados ao banco de dados com id específico
    const brocaRef = db.ref('brocas/' + id);
    brocaRef.set({
        diametro: diametro,
        comprimento: comprimento,
        IDsuucessor: IDsuucessor,
        comprimentoSucessor: comprimentoSucessor,
        tipo: tipo,
        quantidade: quantidade,
        numeroAfiacoes: numeroAfiacoes,
        data: new Date().toLocaleString() // Armazenar data e hora
    });

    // Limpar os campos do formulário
    document.getElementById('adicionarBrocaForm').reset();

    // Atualizar a lista de brocas
    atualizarListaDeBrocas();
    atualizarModais(); // Atualizar listas nos modais

    // Fechar o modal após adicionar
    closeModal('modal3');
}

// Função para fechar o pop-up
function fecharPopUp() {
    document.getElementById('popup-info').style.display = "none";
}


function atualizarListaDeBrocas() {
    db.ref('brocas').once('value', (snapshot) => {
        const brocas = snapshot.val();
        const lista = document.querySelector('.drill-list ul');
        lista.innerHTML = ''; // Limpar a lista atual
        for (const id in brocas) {
            const broca = brocas[id];
            const item = document.createElement('li');
            item.textContent = `#${id} - ø${broca.diametro}mm | ${broca.comprimento}mm de comprimento | ${broca.tipo}`;
            item.onclick = () => abrirPopUp({ ...broca, id }); // Exibir informações ao clicar
            lista.appendChild(item);
        }
    });
}

let selectedBrocaId = null;
let selectedIdsToDelete = [];

function selecionarBrocaNoModal(element, id) {
    const action = document.querySelector('input[name="tab"]:checked').id;

    if (action === 'edit') {
        // Remover a seleção atual, se existir
        const currentSelected = document.querySelector('.modal-content-custom ul li.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        // Adicionar a classe selecionada ao item clicado
        element.classList.add('selected');
        selectedBrocaId = id;
        console.log('Selected ID for edit:', selectedBrocaId);
    } else if (action === 'delete') {
        // Lógica para múltiplas seleções
        element.classList.toggle('selected');
        if (element.classList.contains('selected')) {
            selectedIdsToDelete.push(id);
        } else {
            selectedIdsToDelete = selectedIdsToDelete.filter(selectedId => selectedId !== id);
        }

        // Remover IDs duplicados
        selectedIdsToDelete = [...new Set(selectedIdsToDelete)];
        console.log('Selected IDs for deletion:', selectedIdsToDelete);
    }
}



// Função para atualizar a lista de brocas no HTML dinamicamente
function atualizarListaDeBrocas() {
    db.ref('brocas').once('value', (snapshot) => {
        const brocas = snapshot.val();
        const lista = document.querySelector('.drill-list ul');
        lista.innerHTML = ''; // Limpar a lista atual

        // Converter objeto em array e ordenar pelo ID
        const brocasArray = Object.keys(brocas).map(id => ({ id, ...brocas[id] }));
        brocasArray.sort((a, b) => a.id.localeCompare(b.id)); // Ordenar por ID em ordem crescente

        for (const broca of brocasArray) {
            const item = document.createElement('li');
            item.textContent = `#${broca.id} - ø${broca.diametro}mm | ${broca.comprimento}mm de comprimento | ${broca.tipo}`;
            item.onclick = () => abrirPopUp({ ...broca, id: broca.id }); // Exibir informações ao clicar
            lista.appendChild(item);
        }
    });
}

function handleOkButton() {
    const action = document.querySelector('input[name="tab"]:checked').id;
    if (action === 'edit') {
        if (!selectedBrocaId) {
            alert('Por favor, selecione uma broca para editar.');
            return;
        }
        openEditModal(selectedBrocaId);
    } else if (action === 'delete') {
        if (selectedIdsToDelete.length === 0) {
            alert('Por favor, selecione pelo menos uma broca para deletar.');
            return;
        }
        openDeleteModal();
    }
}






function openEditModal(id) {
    db.ref('brocas/' + id).once('value', (snapshot) => {
        const broca = snapshot.val();
        abrirPopUpParaEdicao({ ...broca, id });
    });
    closeModal('modal2');
}



// Funções de manipulação de modais
document.addEventListener("DOMContentLoaded", function () {
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            const targetId = this.getAttribute('data-target');
            openModal(targetId);
        });
    });

    const closeButtons = document.querySelectorAll('.close, .close-custom, .close-custom3, .close-custom2');
    closeButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const targetModal = this.closest('.modal, .modal-custom, .modal-custom3, .modal-custom2');
            closeModal(targetModal.id);
        });
    });

    // Atualizar as listas de brocas ao carregar a página
    atualizarListaDeBrocas();
    atualizarModais();
});

// Função para resetar o modal
function resetModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const inputs = modal.querySelectorAll('input, select');
        inputs.forEach(input => input.value = '');

        // Desmarcar todos os checkboxes
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);

        // Resetar seleções específicas
        resetarSelecaoBrocas();
    }
}

function handleActionSelection(event) {
    const action = document.querySelector('input[name="tab"]:checked').id;
    const modal = document.querySelector('#modal2');
    const checkboxesEdit = modal.querySelectorAll('.checkbox-edit');
    const checkboxesDelete = modal.querySelectorAll('.checkbox-delete');
    const okButtonContainer = document.getElementById('ok-button-container');

    if (!document.getElementById('action-ok-button')) {
        okButtonContainer.innerHTML = `<button id="action-ok-button" class="submit-button-custom">OK</button>`;
        document.getElementById('action-ok-button').addEventListener('click', handleOkButton);
    }

    if (action === 'edit') {
        checkboxesEdit.forEach(checkbox => {
            checkbox.disabled = false;
            checkbox.style.pointerEvents = 'auto';
            checkbox.style.opacity = '1';
            checkbox.addEventListener('change', handleEditSelection);
        });
        checkboxesDelete.forEach(checkbox => {
            checkbox.disabled = true;
            checkbox.style.pointerEvents = 'none';
            checkbox.style.opacity = '0.5';
        });
    } else if (action === 'delete') {
        checkboxesEdit.forEach(checkbox => {
            checkbox.disabled = true;
            checkbox.style.pointerEvents = 'none';
            checkbox.style.opacity = '0.5';
        });
        checkboxesDelete.forEach(checkbox => {
            checkbox.disabled = false;
            checkbox.style.pointerEvents = 'auto';
            checkbox.style.opacity = '1';
            checkbox.addEventListener('change', handleDeleteSelection);
        });
    }
}


// Função para lidar com a seleção de edição
function handleEditSelection(event) {
    const allCheckboxes = document.querySelectorAll('.checkbox-edit');
    allCheckboxes.forEach(checkbox => checkbox.checked = false);
    event.target.checked = true;
}

// Função para lidar com a seleção de exclusão
function handleDeleteSelection(event) {
    const selectedIds = [...document.querySelectorAll('.checkbox-delete:checked')].map(cb => cb.getAttribute('data-id'));
    if (selectedIds.length > 0) {
        document.getElementById('ok-button-container').innerHTML = `<button id="delete-ok-button" class="submit-button-custom">OK</button>`;
        document.getElementById('delete-ok-button').addEventListener('click', () => openDeleteModal(selectedIds));
    } else {
        const okButton = document.getElementById('delete-ok-button');
        if (okButton) okButton.remove();
    }
}

function openDeleteModal() {
    console.log('Abrindo modal de exclusão para os IDs:', selectedIdsToDelete);

    // Remover IDs duplicados
    const uniqueIds = [...new Set(selectedIdsToDelete)];
    console.log('Unique IDs after filtering:', uniqueIds);

    if (uniqueIds.length === 0) {
        alert('Por favor, selecione pelo menos uma broca para deletar.');
        return;
    }

    // Remove modal antigo se existir
    const oldModal = document.getElementById('modal-delete-confirm');
    if (oldModal) {
        oldModal.remove();
    }

    const modalContent = `
        <div class="modal-custom2" id="modal-delete-confirm">
            <div class="modal-content-custom2">
                <span class="close-custom2" onclick="closeModal('modal-delete-confirm')">&times;</span>
                <h2>Confirmar Exclusão</h2>
                <p>Você tem certeza que deseja excluir as seguintes brocas?</p>
                <ul id="broca-delete-list">
                    ${uniqueIds.map(id => `<li>${id}</li>`).join('')}
                </ul>
                <button class="submit-button2" onclick='confirmDelete()'>Confirmar</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalContent);
    openModal('modal-delete-confirm');
}


function confirmDelete() {
    console.log('Confirmando exclusão para os IDs:', selectedIdsToDelete);
    const idsToDelete = [...selectedIdsToDelete];
    console.log('IDs to delete:', idsToDelete);

    Promise.all(idsToDelete.map(id => db.ref('brocas/' + id).remove()))
        .then(() => {
            console.log('Brocas deletadas com sucesso:', idsToDelete);
            alert('Brocas deletadas com sucesso!');
            closeModal('modal-delete-confirm');
            document.getElementById('broca-delete-list').innerHTML = ''; // Limpar a UL
            atualizarListaDeBrocas();
            atualizarModais(); // Atualizar modais após deletar
            resetarSelecaoBrocas(); // Resetar seleção após exclusão
        })
        .catch(error => {
            console.error('Erro ao deletar brocas:', error);
            alert('Erro ao deletar brocas: ' + error.message);
        });
}


function salvarEdicao(event, id) {
    event.preventDefault(); // Evitar o envio padrão do formulário

    const editedBroca = {
        diametro: document.getElementById('edit-diametro').value.replace('ø', '').replace('mm', ''),
        comprimento: document.getElementById('edit-comprimento').value.replace('mm', ''),
        IDsuucessor: document.getElementById('edit-IDsuucessor').value || null,
        comprimentoSucessor: document.getElementById('edit-comprimentoSucessor').value.replace('mm', '') || null,
        tipo: document.getElementById('edit-tipo').value,
        quantidade: document.getElementById('edit-quantidade').value
    };

    db.ref('brocas/' + id).update(editedBroca).then(() => {
        alert('Broca editada com sucesso!');
        fecharPopUp();
        atualizarListaDeBrocas();
        atualizarModais(); // Atualizar modais após editar
        atualizarPopUp({}); // Passar dados vazios para resetar o pop-up
    }).catch(error => {
        alert('Erro ao editar broca: ' + error.message);
    });
}

// Função para inicializar as ações dos botões de edição e exclusão
function initActions() {
    document.querySelector('#edit').addEventListener('change', handleActionSelection);
    document.querySelector('#delete').addEventListener('change', handleActionSelection);
}

// Chamar a função quando a página carregar
window.onload = () => {
    atualizarListaDeBrocas();
    atualizarModais();
    initActions();
}

function atualizarPopUp(broca) {
    const popupContent = `
        <div class="popup-content">
            <span class="close" onclick="fecharPopUp()">&times;</span>
            <h2>Informações da Broca</h2>
            <div class="input-container-custom">
                <label>ID:</label>
                <span id="broca-id">#${broca.id}</span>
            </div>
            <div class="input-container-custom">
                <label>Diâmetro:</label>
                <span id="broca-diametro">ø${broca.diametro}mm</span>
            </div>
            <div class="input-container-custom">
                <label>Comprimento:</label>
                <span id="broca-comprimento">${broca.comprimento}mm</span>
            </div>
            <div class="input-container-custom">
                <label>ID Sucessor:</label>
                <span id="broca-IDsuucessor">${broca.IDsuucessor || '-'}</span>
            </div>
            <div class="input-container-custom">
                <label>Comprimento Sucessor:</label>
                <span id="broca-comprimentoSucessor">${broca.comprimentoSucessor || '-'}mm</span>
            </div>
            <div class="input-container-custom">
                <label>Data:</label>
                <span id="broca-data">${broca.data}</span>
            </div>
            <div class="input-container-custom">
                <label>Tipo:</label>
                <span id="broca-tipo">${broca.tipo}</span>
            </div>
            <div class="input-container-custom">
                <label>Número de Afiacoes:</label>
                <span id="broca-numeroAfiacoes">${broca.numeroAfiacoes}</span>
            </div>
            <div class="input-container-custom">
                <label>Quantidade:</label>
                <span id="broca-quantidade">${broca.quantidade}</span>
            </div>
        </div>
    `;

    const popupInfo = document.getElementById('popup-info');
    if (popupInfo) {
        popupInfo.innerHTML = popupContent;
    } else {
        console.error('Elemento popup-info não foi encontrado.');
    }
}

function abrirPopUp(broca) {
    atualizarPopUp(broca);
    document.getElementById('popup-info').style.display = 'block';
}

function atualizarModais() {
    db.ref('brocas').once('value', (snapshot) => {
        const brocas = snapshot.val();
        
        // Atualizar modal 1
        const modal1List = document.querySelector('#modal1 ul');
        modal1List.innerHTML = '';
        for (const id in brocas) {
            const broca = brocas[id];
            const item = document.createElement('li');
            item.innerHTML = `<input type="checkbox" class="checkbox-delete" data-id="${id}"> #${id} - ø${broca.diametro}mm | ${broca.comprimento}mm de comprimento | ${broca.tipo}`;
            modal1List.appendChild(item);
        }

        // Atualizar modal 2
        const modal2List = document.querySelector('#modal2 ul.checkbox-list');
        modal2List.innerHTML = '';
        for (const id in brocas) {
            const broca = brocas[id];
            const item = document.createElement('li');
            item.textContent = `#${id} - ø${broca.diametro}mm | ${broca.comprimento}mm de comprimento | ${broca.tipo}`;
            item.onclick = () => selecionarBrocaNoModal(item, id);
            modal2List.appendChild(item);
        }
    });

    resetarSelecaoBrocas(); // Resetar a seleção de brocas após atualizar os modais
}

// Função para abrir o pop-up para editar broca
function abrirPopUpParaEdicao(broca) {
    document.getElementById('popup-info').innerHTML = `
        <div class="popup-content">
            <span class="close" onclick="fecharPopUp()">&times;</span>
            <h2>Editar Broca</h2>
            <form id="editarBrocaForm" onsubmit="salvarEdicao(event, '${broca.id}')">
                <div class="input-container-custom">
                    <label>ID:</label>
                    <span>${broca.id}</span>
                </div>
                <div class="input-container-custom">
                    <label for="edit-diametro">Diâmetro:</label>
                    <input type="text" id="edit-diametro" name="diameter" value="${broca.diametro}" onblur="formatDiameter(this)" oninput="clearFormat(this, 'Digite o diâmetro')">
                </div>
                <div class="input-container-custom">
                    <label for="edit-comprimento">Comprimento:</label>
                    <input type="text" id="edit-comprimento" name="length" value="${broca.comprimento}" onblur="formatLength(this)" oninput="clearFormat(this, 'Digite o comprimento')">
                </div>
                <div class="input-container-custom">
                    <label for="edit-IDsuucessor">ID Sucessor:</label>
                    <input type="text" id="edit-IDsuucessor" name="IDsuucessor" value="${broca.IDsuucessor || ''}">
                </div>
                <div class="input-container-custom">
                    <label for="edit-comprimentoSucessor">Comprimento Sucessor:</label>
                    <input type="text" id="edit-comprimentoSucessor" name="lengthSuccessor" value="${broca.comprimentoSucessor || ''}" onblur="formatLength(this)" oninput="clearFormat(this, 'Digite o comprimento')">
                </div>
                <div class="input-container-custom">
                    <label for="edit-tipo">Tipo de Broca:</label>
                    <select id="edit-tipo" name="type">
                        <option value="Brocas MD (metal duro)" ${broca.tipo === 'Brocas MD (metal duro)' ? 'selected' : ''}>Brocas MD (metal duro)</option>
                        <option value="Brocas de centro" ${broca.tipo === 'Brocas de centro' ? 'selected' : ''}>Brocas de centro</option>
                        <option value="Fresas de topo" ${broca.tipo === 'Fresas de topo' ? 'selected' : ''}>Fresas de topo</option>
                        <option value="Brocas intercambiáveis" ${broca.tipo === 'Brocas intercambiáveis' ? 'selected' : ''}>Brocas intercambiáveis</option>
                    </select>
                </div>
                <div class="input-container-custom">
                    <label for="edit-quantidade">Quantidade:</label>
                    <input type="number" id="edit-quantidade" name="quantity" value="${broca.quantidade}" min="1">
                </div>
                <button type="submit" class="submit-button-custom">Salvar</button>
            </form>
        </div>
    `;
    document.getElementById('popup-info').style.display = "block";
}

// Função para resetar a seleção de brocas na página inicial
function resetSelection() {
    const brocaListItems = document.querySelectorAll('.drill-list li');
    brocaListItems.forEach(item => item.classList.remove('selected'));
}

// Função para buscar e exibir sugestões de brocas enquanto digita
function exibirSugestoes(event) {
    const searchQuery = event.target.value.trim().toLowerCase();
    const suggestionsContainer = document.getElementById('suggestions');
    
    if (searchQuery) {
        db.ref('brocas').once('value', (snapshot) => {
            const brocas = snapshot.val();
            suggestionsContainer.innerHTML = ''; // Limpar sugestões anteriores
            
            if (brocas) {
                let suggestions = [];
                
                for (const id in brocas) {
                    if (id.includes(searchQuery.replace('#', ''))) { // Ignorar #
                        const broca = brocas[id];
                        suggestions.push({ id, ...broca });
                    }
                }

                // Ordenar sugestões para priorizar o ID que está sendo digitado
                suggestions.sort((a, b) => a.id.indexOf(searchQuery.replace('#', '')) - b.id.indexOf(searchQuery.replace('#', '')));

                suggestions.forEach(broca => {
                    const suggestion = document.createElement('div');
                    suggestion.textContent = `#${broca.id} - ø${broca.diametro}mm | ${broca.comprimento}mm de comprimento | ${broca.tipo}`;
                    suggestion.onclick = () => {
                        abrirPopUp(broca); // Exibir informações ao clicar na sugestão
                        suggestionsContainer.innerHTML = ''; // Limpar sugestões após seleção
                    };
                    suggestionsContainer.appendChild(suggestion);
                });
            } else {
                suggestionsContainer.innerHTML = '<div>Nenhuma broca encontrada</div>';
            }
        });
        suggestionsContainer.style.display = 'block'; // Mostrar sugestões
    } else {
        suggestionsContainer.innerHTML = ''; // Limpar sugestões se a busca estiver vazia
        suggestionsContainer.style.display = 'none'; // Esconder sugestões
    }
}

// Função para buscar uma broca pelo ID e mostrar suas informações ao pressionar Enter
function buscarBrocaPeloID(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evitar o envio padrão do formulário
        
        const searchID = event.target.value.trim().replace('#', '');
        const suggestionsContainer = document.getElementById('suggestions');
        
        if (searchID) {
            db.ref('brocas/' + searchID).once('value', (snapshot) => {
                const broca = snapshot.val();
                if (broca) {
                    abrirPopUp({ ...broca, id: searchID });
                    suggestionsContainer.innerHTML = ''; // Limpar sugestões após seleção
                    suggestionsContainer.style.display = 'none'; // Esconder sugestões
                } else {
                    alert('Broca não encontrada');
                }
            });
        } else {
            alert('Por favor, digite um ID válido');
        }
    }
}

// Função para esconder sugestões ao clicar fora da barra de busca
function esconderSugestoes(event) {
    const searchInput = document.getElementById('brocaSearchInput');
    const suggestionsContainer = document.getElementById('suggestions');
    
    if (event.target !== searchInput && event.target.parentNode !== suggestionsContainer) {
        suggestionsContainer.style.display = 'none'; // Esconder sugestões
        suggestionsContainer.innerHTML = ''; // Limpar sugestões
        searchInput.value = ''; // Limpar valor do input
    }
}

// Adicionar eventos ao campo de busca
document.getElementById('brocaSearchInput').addEventListener('input', exibirSugestoes);
document.getElementById('brocaSearchInput').addEventListener('keypress', buscarBrocaPeloID);
document.addEventListener('click', esconderSugestoes);

function resetarSelecaoBrocas() {
    console.log('Resetando a seleção de brocas');
    selectedIdsToDelete = [];
    selectedBrocaId = null; // Resetar ID selecionado
    const selectedItems = document.querySelectorAll('.modal-content-custom ul li.selected');
    selectedItems.forEach(item => item.classList.remove('selected'));
    const checkboxesDelete = document.querySelectorAll('.checkbox-delete');
    checkboxesDelete.forEach(checkbox => checkbox.checked = false);
    console.log('Seleção resetada', selectedIdsToDelete);
}

// Adicionar eventos ao botão de fechar para resetar a seleção
document.querySelectorAll('.close-custom, .close-custom2, .close-custom3').forEach(button => {
    button.addEventListener('click', handleCloseModal);
});

function handleCloseModal() {
    console.log('Modal fechado e seleção resetada');
    resetarSelecaoBrocas();
}


// Teste para garantir que está funcionando
document.querySelectorAll('.close-custom, .close-custom2, .close-custom3').forEach(button => {
    button.addEventListener('click', () => {
        console.log('Fechando modal, resetando seleção');
        resetarSelecaoBrocas();
    });
});