/**
 * Financial Calculation Engine for Banco Inbursa and Capital Consig Terms
 */

export const calculateInbursaRefund = (contracts) => {
  return contracts.map(contract => {
    const balance = parseFloat(contract.balance) || 0;
    const installmentsPaid = parseInt(contract.installmentsPaid) || 0;
    const paidParcelValue = parseFloat(contract.paidParcelValue) || 0;

    // Calculando desconto (parcelas pagas * valor da parcela de desconto)
    const discount = installmentsPaid * paidParcelValue;
    
    // O valor líquido para quitação do contrato é o saldo devedor menos o desconto
    const liquidationValue = Math.max(0, balance - discount);

    return {
      ...contract,
      balance: balance.toFixed(2),
      discount: discount.toFixed(2),
      liquidationValue: liquidationValue.toFixed(2)
    };
  });
};
