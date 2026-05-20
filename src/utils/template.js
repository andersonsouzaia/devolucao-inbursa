/**
 * Dynamic HTML Document Generator for Banco Inbursa S.A.
 */

export const generateDocumentHTML = (data) => {
  const { client, contracts, totals, settings } = data;
  
  const protocol = `INB-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000+Math.random()*9000)}`;
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const fullDateStr = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const totalOriginalFormatted = parseFloat(totals.original).toLocaleString('pt-BR', {minimumFractionDigits: 2});
  const totalLiquidationFormatted = parseFloat(totals.liquidation).toLocaleString('pt-BR', {minimumFractionDigits: 2});
  const totalDiscountFormatted = parseFloat(totals.discount).toLocaleString('pt-BR', {minimumFractionDigits: 2});

  // Identificar as instituições presentes nos contratos para o cabeçalho/narrativa
  const institutions = [...new Set(contracts.map(c => c.bank.trim().toUpperCase()))];
  let instText = "Banco Inbursa S.A.";
  if (institutions.length > 1) {
    // Se tiver Capital Consig ou outra
    const otherInsts = institutions.filter(i => i !== "BANCO INBURSA" && i !== "INBURSA");
    if (otherInsts.length > 0) {
      instText = `Banco Inbursa S.A. juntamente com a emissora parceira ${otherInsts.map(i => `<strong>${i}</strong>`).join(' e ')}`;
    }
  }

  // Montagem da lista de contratos detalhada para o parágrafo
  const contractsDetailText = contracts.map(c => {
    const typeLabel = c.type === 'card' ? 'Cartão de Crédito Consignado' : 'Empréstimo Consignado';
    return `01 ${typeLabel} ${c.bank}`;
  }).join(' e ');

  const rowsHtml = contracts.map(c => {
    const typeLabel = c.type === 'card' ? 'Cartão Consignado' : 'Empréstimo';
    const parcLabel = c.type === 'card' ? `${c.installmentsPaid}/-` : `${c.installmentsPaid}/-`;
    const parcelMensal = parseFloat(c.parcelValue) > 0 ? `R$ ${parseFloat(c.parcelValue).toLocaleString('pt-BR', {minimumFractionDigits:2})}` : '-';

    return `
      <tr>
        <td class="mono">${typeLabel} (${c.contractNumber || 'S/N'})</td>
        <td>${c.bank.toUpperCase()}</td>
        <td class="center">${parcLabel}</td>
        <td class="right mono">${parcelMensal}</td>
        <td class="right strike mono">R$ ${parseFloat(c.balance).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
        <td class="right green mono">R$ ${parseFloat(c.liquidationValue).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
        <td class="center"><span class="status-ativo">Liquidação</span></td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banco Inbursa — Termo de Acordo e Quitação | Protocolo ${protocol}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Dancing+Script:wght@600&display=swap');

    :root {
      --primary: #004b87; 
      --accent: #c9a84c;
      --text: #2c2c2c;
      --text-muted: #8a8a8a;
      --border: #d4d0c8;
      --bg: #ffffff;
      --bg-cream: #faf8f5;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page { size: A4 portrait; margin: 0 !important; padding: 0 !important; }
    html { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: var(--text);
      background: #e8e4dc;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      width: 210mm;
      height: 297mm;
      margin: 20px auto;
      background: white;
      position: relative;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 40px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .header-strip {
      background: var(--primary);
      padding: 22px 42px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid var(--accent);
      color: white;
    }

    .brand-name { font-family: 'Georgia', 'Times New Roman', serif; font-size: 26px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
    .brand-name span { color: white; font-style: normal; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-left: 3px; }
    .header-meta { text-align: right; font-size: 9px; line-height: 1.4; opacity: 0.9; letter-spacing: 0.5px; }

    .doc-subtitle { text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text); padding: 25px 42px 0 42px; font-weight: 700; }

    .valor-section {
      margin: 25px 42px;
      padding: 25px 30px;
      background: var(--primary);
      border-radius: 6px;
      color: white;
      border-top: 2px solid var(--accent);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .valor-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 5px; font-weight: 600; }
    .valor-amount { font-family: 'Inter', sans-serif; font-size: 38px; font-weight: 700; letter-spacing: -1px; }

    .client-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #eee; margin: 0 42px; border: 1px solid #eee; border-radius: 4px; overflow: hidden; }
    .client-field { background: white; padding: 15px; }
    .field-label { font-size: 8px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field-value { font-size: 12px; font-weight: 600; color: var(--primary); }

    .info-boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 42px; }
    .info-box { border: 1px solid #eee; padding: 15px; border-left: 3px solid var(--accent); background: var(--bg-cream); }

    .declaracao-body { margin: 25px 42px; font-family: 'Cormorant Garamond', serif; font-size: 14px; line-height: 1.6; text-align: justify; color: #333; }
    .declaracao-body p { margin-bottom: 15px; }
    .declaracao-body strong { color: var(--primary); font-weight: 600; }

    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 25px 42px; }
    .summary-card { padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #eee; }
    .summary-card.before { background: #fafafa; border-bottom: 2px solid #999; }
    .summary-card.after { background: #fdfaf2; border-bottom: 2px solid var(--accent); }
    .summary-card.saving { background: #f0f7f2; border-bottom: 2px solid #2d7a3a; }
    .card-label { font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 8px; }
    .card-value { font-size: 20px; font-weight: 700; color: var(--primary); margin-bottom: 4px; font-family: 'Inter', sans-serif;}
    .saving .card-value { color: #2d7a3a; }
    .card-detail { font-size: 10px; color: #666; font-style: italic; }

    .regularizacao-body { margin: 25px 42px; font-family: 'Cormorant Garamond', serif; font-size: 14px; line-height: 1.6; text-align: justify; padding: 20px; background: #fafafa; border-left: 3px solid var(--primary); }
    .regularizacao-body p { margin-bottom: 10px; }

    .contracts-table { width: calc(100% - 84px); margin: 25px 42px; border-collapse: collapse; font-family: 'Inter', sans-serif; border: 1px solid #eee; }
    .contracts-table th { background: var(--primary); color: white; padding: 12px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
    .contracts-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 11px; }
    .contracts-table tr:nth-child(even) { background: #fafafa; }
    .right { text-align: right; }
    .center { text-align: center; }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 10.5px !important; }
    .strike { text-decoration: line-through; color: #9e3a3a; opacity: 0.7; }
    .green { color: #2d7a3a; font-weight: 700; }
    .highlight { background: rgba(201, 168, 76, 0.1); }
    
    .status-ativo { background: #2d7a3a; color: white; padding: 3px 8px; border-radius: 12px; font-size: 8px; font-weight: 700; text-transform: uppercase; }

    .signature-section { margin: 40px 42px 0 42px; display: flex; justify-content: space-between; align-items: flex-end; }
    .signature-block { display: flex; justify-content: space-between; width: 100%; border-top: 1px solid #eee; padding-top: 25px; }
    .signature-left { display: flex; flex-direction: column; }
    .signature-entity { font-weight: 700; font-size: 12px; color: var(--primary); margin-bottom: 2px; }
    .signature-dept { font-size: 10px; color: var(--text-muted); margin-bottom: 10px; }
    .signature-locale { font-size: 10px; font-style: italic; color: #555; }
    .signature-right { display: flex; flex-direction: column; align-items: center; position: relative; }
    .signature-css { font-family: 'Dancing Script', cursive; font-size: 32px; color: #1a1a2e; margin-bottom: -5px; z-index: 10; opacity: 0.8; letter-spacing: 1px; }
    .signature-line { width: 220px; height: 1px; background: #333; margin-bottom: 5px; }
    .signature-right span { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

    .footer { margin-top: auto; background: #fafafa; border-top: 1px solid #eee; padding: 20px 42px; display: flex; flex-direction: column; gap: 10px; }
    .footer-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .footer-left { display: flex; flex-direction: column; font-size: 8px; color: #888; gap: 3px; }
    .footer-right { display: flex; flex-direction: column; font-size: 8px; color: #888; text-align: right; gap: 3px; }
    .footer-left .highlight { color: var(--primary); font-weight: 700; }
    .footer-seal { font-size: 7px; text-align: center; color: #aaa; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.5px; }

    @media print { 
      .page { margin: 0; box-shadow: none; border: none; } 
      body { background: white; } 
    }
  </style>
</head>
<body>

  <!-- PÁGINA 1 -->
  <div class="page">
    <div class="header-strip">
      <div class="brand-name">Banco <span>Inbursa</span></div>
      <div class="header-meta">
        <strong>PROTOCOLO:</strong> ${protocol}<br>
        <strong>EMISSÃO:</strong> ${dateStr} — ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
      </div>
    </div>

    <div class="doc-subtitle">Termo de Acordo e Quitação Antecipada de Contratos</div>

    <div class="valor-section">
      <div>
        <div class="valor-label">Valor Acordado para Quitação</div>
        <div class="valor-amount">R$ ${totalLiquidationFormatted}</div>
      </div>
      <div style="text-align: right;">
        <div class="valor-label" style="opacity: 0.6;">Dívida Original Conjunta</div>
        <div style="font-size: 16px; opacity: 0.8; text-decoration: line-through;">R$ ${totalOriginalFormatted}</div>
      </div>
    </div>

    <div class="client-grid">
      <div class="client-field">
        <div class="field-label">Nome do Beneficiário</div>
        <div class="field-value">${client.name.toUpperCase()}</div>
      </div>
      <div class="client-field">
        <div class="field-label">Documento (CPF)</div>
        <div class="field-value">${client.cpf}</div>
      </div>
      <div class="client-field">
        <div class="field-label">NB (Benefício INSS)</div>
        <div class="field-value">${client.nb}</div>
      </div>
    </div>

    <div class="info-boxes">
      <div class="info-box">
        <div class="field-label">Natureza da Operação</div>
        <div class="field-value">Quitação Múltipla Contratual</div>
      </div>
      <div class="info-box" style="border-left-color: #2d7a3a;">
        <div class="field-label">Status da Negociação</div>
        <div class="field-value" style="color: #2d7a3a;">Acordo Finalizado</div>
      </div>
    </div>

    <div class="declaracao-body">
      <p>
        O <strong>Banco Inbursa S.A.</strong>, instituição financeira devidamente constituída, juntamente com as emissoras parceiras enquadradas, vem por meio deste instrumento formalizar o <strong>Acordo de Quitação Antecipada</strong> referente aos contratos de titularidade do(a) cliente <strong>${client.name.toUpperCase()}</strong>.
      </p>
      <p>
        Fica atestado que o saldo devedor integral das referidas operações (${contractsDetailText}), originalmente consolidados em <strong>R$ ${totalOriginalFormatted}</strong>, será liquidado e definitivamente extinto com o abatimento integral das parcelas já pagas (totalizando uma redução de <strong>R$ ${totalDiscountFormatted}</strong>), mediante o pagamento em cota única do valor acordado estipulado em <strong>R$ ${totalLiquidationFormatted}</strong>.
      </p>
      <p>
        Após a compensação sistêmica do valor pactuado, as instituições procederão com a baixa definitiva dos respectivos contratos em todos os órgãos de proteção ao crédito e solicitarão a imediata liberação/desaverbação da margem consignável correspondente junto à fonte pagadora (INSS).
      </p>
    </div>

    <div class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <span class="highlight">Banco Inbursa S.A. | CNPJ 04.866.275/0001-33</span>
          <span>Av. Presidente Juscelino Kubitschek, 1400 — São Paulo, SP</span>
        </div>
        <div class="footer-right">
          <span>Protocolo Interno: ${protocol}-QUIT</span>
          <span>Emitido em ${dateStr} | Documento confidencial</span>
        </div>
      </div>
      <div class="footer-seal">
        Este documento possui validade jurídica e foi gerado eletronicamente pelos sistemas do Banco Inbursa S.A. — Página 1 de 2
      </div>
    </div>
  </div>

  <!-- PÁGINA 2 -->
  <div class="page">
    <div class="header-strip" style="padding: 12px 42px;">
      <div class="brand-name" style="font-size: 16px;">Banco <span>Inbursa</span></div>
      <div class="header-meta">${protocol}</div>
    </div>

    <div class="doc-subtitle">Resumo Operacional e Liquidação</div>

    <div class="summary-cards">
      <div class="summary-card before">
        <div class="card-label">Saldo Devedor Atual</div>
        <div class="card-value">R$ ${totalOriginalFormatted}</div>
        <div class="card-detail">Soma dos contratos (projetada)</div>
      </div>
      <div class="summary-card after">
        <div class="card-label">Valor de Quitação</div>
        <div class="card-value">R$ ${totalLiquidationFormatted}</div>
        <div class="card-detail">Pagamento único (Boleto/Pix)</div>
      </div>
      <div class="summary-card saving">
        <div class="card-label">Desconto Concedido</div>
        <div class="card-value">R$ ${totalDiscountFormatted}</div>
        <div class="card-detail">Abatimento de parcelas pagas</div>
      </div>
    </div>

    <table class="contracts-table">
      <thead>
        <tr>
          <th>TIPO DE CONTRATO</th>
          <th>INSTITUIÇÃO</th>
          <th class="center">PARC. PAGAS</th>
          <th class="right">PARCELA MENSAL</th>
          <th class="right">SALDO ORIGINAL</th>
          <th class="right">VALOR P/ QUITAÇÃO</th>
          <th class="center">STATUS</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4"><strong>Totais do Acordo</strong></td>
          <td class="right strike highlight"><strong>R$ ${totalOriginalFormatted}</strong></td>
          <td class="right green highlight" style="font-size: 12px;"><strong>R$ ${totalLiquidationFormatted}</strong></td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div class="regularizacao-body">
      <p>
        <strong>Termos da Liquidação Conjunta:</strong> O cliente declara ciência da quitação simultânea das operações descritas acima com as respectivas baixas junto às instituições enquadradas.
      </p>
      <p>
        Este instrumento serve como recibo provisório do acordo. A quitação final e os consequentes termos de liberação de margem somente surtirão efeitos legais após a confirmação integral do crédito de R$ ${totalLiquidationFormatted} nas contas do Banco Inbursa S.A.
      </p>
    </div>

    <div class="signature-section">
      <div class="signature-block">
        <div class="signature-left">
          <span class="signature-entity">Banco Inbursa S.A.</span>
          <span class="signature-dept">Departamento de Negociação e Recuperação de Crédito</span>
          <span class="signature-locale">São Paulo, ${fullDateStr}</span>
        </div>
        <div class="signature-right">
          ${settings.signed ? `
            <div class="signature-css">B. Inbursa</div>
            <div class="signature-line"></div>
            <span>Assinatura Eletrônica Autorizada</span>
          ` : `
            <div style="height: 40px;"></div>
            <div class="signature-line"></div>
            <span>Assinatura do Cliente / Beneficiário</span>
          `}
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <span class="highlight">Banco Inbursa S.A. | CNPJ 04.866.275/0001-33</span>
          <span>Av. Presidente Juscelino Kubitschek, 1400 — São Paulo, SP</span>
        </div>
        <div class="footer-right">
          <span>Protocolo: ${protocol}</span>
          <span>Emitido em ${dateStr} | Válido por 5 dias úteis</span>
        </div>
      </div>
      <div class="footer-seal">
        Este documento possui validade jurídica e foi gerado eletronicamente pelos sistemas do Banco Inbursa S.A. — Página 2 de 2
      </div>
    </div>
  </div>

</body>
</html>
  `;
};
