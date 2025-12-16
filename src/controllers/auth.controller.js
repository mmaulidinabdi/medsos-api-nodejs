export const RegisterUser = (req, res) => {
  const { username, email, password, fullname } = req.body;

  res.json({
    msg: "Register User",
    data: { username, email, password, fullname },
  });
};

export const LoginUser = (req, res) => {
  res.json({
    msg: "Login User",
  });
};
