const userLogout = (req, res) => {

  console.log("hello sajin ");
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export default userLogout;