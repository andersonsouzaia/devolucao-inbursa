import { calculateInbursaRefund } from './src/utils/finance.js';
import { generateDocumentHTML } from './src/utils/template.js';

let contracts = [
  { 
    id: 1, 
    type: 'card', 
    bank: 'CAPITAL CONSIG', 
    contractNumber: '6324121767', 
    parcelValue: '275.44', 
    balance: '6241.94', 
    installmentsPaid: '4', 
    paidParcelValue: '275.44' 
  },
  { 
    id: 2, 
    type: 'card', 
    bank: 'CAPITAL CONSIG', 
    contractNumber: '6324121768', 
    parcelValue: '275.44', 
    balance: '6522.15', 
    installmentsPaid: '4', 
    paidParcelValue: '275.44' 
  },
  { 
    id: 3, 
    type: 'loan', 
    bank: 'BANCO INBURSA', 
    contractNumber: '6324121769', 
    parcelValue: '480.00', 
    balance: '20191.93', 
    installmentsPaid: '4', 
    paidParcelValue: '480.00' 
  }
];

const contractList = document.getElementById('contractList');
const addContractBtn = document.getElementById('addContract');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');
const previewFrame = document.getElementById('previewFrame');

function populateDefaultClient() {
  document.getElementById('clientName').value = 'EGILDO OLIVEIRA GONÇALVES';
  document.getElementById('clientCPF').value = '339.722.305-91';
  document.getElementById('clientNB').value = '632.412.176-7 - BA';
}

function renderContracts() {
  contractList.innerHTML = contracts.map(c => `
    <div class="contract-row" data-id="${c.id}">
      <button class="remove-contract" onclick="window.removeContract(${c.id})">&times;</button>
      
      <div class="input-grid">
        <div class="input-group">
          <label>Tipo</label>
          <select class="contract-type" onchange="window.changeType(${c.id}, this.value)">
            <option value="loan" ${c.type === 'loan' ? 'selected' : ''}>Empréstimo</option>
            <option value="card" ${c.type === 'card' ? 'selected' : ''}>Cartão Consignado</option>
          </select>
        </div>
        <div class="input-group">
          <label>Instituição</label>
          <input type="text" class="contract-bank" value="${c.bank}" placeholder="Ex: BANCO INBURSA">
        </div>
      </div>

      <div class="input-grid">
        <div class="input-group">
          <label>Nº Contrato</label>
          <input type="text" class="contract-num" value="${c.contractNumber}" placeholder="000000000">
        </div>
        <div class="input-group">
          <label>Saldo Devedor (R$)</label>
          <input type="number" class="contract-balance" value="${c.balance}" step="0.01" placeholder="0.00">
        </div>
      </div>

      <div class="input-grid">
        <div class="input-group">
          <label>Parcelas Pagas</label>
          <input type="number" class="contract-paid-count" value="${c.installmentsPaid}" placeholder="Ex: 4">
        </div>
        <div class="input-group">
          <label>Valor da Parcela (R$)</label>
          <input type="number" class="contract-parcel-val" value="${c.parcelValue}" step="0.01" placeholder="0.00">
        </div>
      </div>
      
      <!-- Campo oculto/auxiliar para o valor de desconto individual -->
      <div class="input-group" style="display:none;">
        <input type="number" class="contract-paid-val" value="${c.paidParcelValue}">
      </div>
    </div>
  `).join('');
}

window.removeContract = (id) => {
  contracts = contracts.filter(c => c.id !== id);
  renderContracts();
};

window.changeType = (id, value) => {
  const contract = contracts.find(c => c.id === id);
  if (contract) {
    contract.type = value;
    if (value === 'card') {
      contract.bank = 'CAPITAL CONSIG';
      contract.parcelValue = '275.44';
      contract.paidParcelValue = '275.44';
    } else {
      contract.bank = 'BANCO INBURSA';
      contract.parcelValue = '480.00';
      contract.paidParcelValue = '480.00';
    }
    renderContracts();
  }
};

addContractBtn.addEventListener('click', () => {
  contracts.push({
    id: Date.now(),
    type: 'loan',
    bank: 'BANCO INBURSA',
    contractNumber: '',
    parcelValue: '480.00',
    balance: '20000.00',
    installmentsPaid: '4',
    paidParcelValue: '480.00'
  });
  renderContracts();
});

generateBtn.addEventListener('click', () => {
  // Coletar dados do cliente
  const client = {
    name: document.getElementById('clientName').value || 'EGILDO OLIVEIRA GONÇALVES',
    cpf: document.getElementById('clientCPF').value || '339.722.305-91',
    nb: document.getElementById('clientNB').value || '632.412.176-7 - BA'
  };

  // Coletar e atualizar contratos do DOM
  const rows = document.querySelectorAll('.contract-row');
  const contractData = Array.from(rows).map(row => {
    const type = row.querySelector('.contract-type').value;
    const parcelValue = row.querySelector('.contract-parcel-val').value;
    return {
      type,
      bank: row.querySelector('.contract-bank').value,
      contractNumber: row.querySelector('.contract-num').value,
      parcelValue: parcelValue,
      balance: row.querySelector('.contract-balance').value,
      installmentsPaid: row.querySelector('.contract-paid-count').value,
      paidParcelValue: parcelValue // Desconto segue o valor da parcela preenchida
    };
  });

  const settings = {
    signed: document.getElementById('isSigned').checked
  };

  const calculatedContracts = calculateInbursaRefund(contractData);

  // Calcular consolidações de totais
  const totalOriginal = calculatedContracts.reduce((sum, c) => sum + parseFloat(c.balance), 0);
  const totalLiquidation = calculatedContracts.reduce((sum, c) => sum + parseFloat(c.liquidationValue), 0);
  const totalDiscount = calculatedContracts.reduce((sum, c) => sum + parseFloat(c.discount), 0);

  const docData = {
    client,
    contracts: calculatedContracts,
    totals: {
      original: totalOriginal,
      liquidation: totalLiquidation,
      discount: totalDiscount
    },
    settings
  };

  const html = generateDocumentHTML(docData);
  
  // Exibir no Iframe
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  previewFrame.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:none; background:white; border-radius:8px;"></iframe>`;
});

printBtn.addEventListener('click', () => {
  const iframe = previewFrame.querySelector('iframe');
  if (iframe) {
    iframe.contentWindow.print();
  } else {
    alert('Por favor, gere o documento antes de solicitar a impressão!');
  }
});

// Inicialização
populateDefaultClient();
renderContracts();
// Autogerar o termo na carga inicial do painel para melhor UX
setTimeout(() => {
  generateBtn.click();
}, 200);
