// Check email with reguler expression
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}

module.exports = {
  validateEmail,
};
