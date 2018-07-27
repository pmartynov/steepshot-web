export function checkValidTokensAmount(tokensAmount) {
  let amount = tokensAmount.toString();
  amount = amount.match(/\d+(\.\d+)?/);
  if (amount[0] === amount.input) return true;
  return false;
}