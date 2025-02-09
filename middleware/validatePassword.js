// middleware/validatePassword.js
const validatePassword = (req, res, next) => {
  const { newPassword, confirmPassword } = req.body;

  if (newPassword) {
    // Check password length
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters long");
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error("Passwords do not match");
    }
  }

  next();
};

export default validatePassword;
