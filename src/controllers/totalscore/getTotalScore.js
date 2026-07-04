import UserProgress from "../../models/users/userProgress.models.js";

const getTotalScore = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware

    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({ message: "No progress found" });
    }

    res.status(200).json(progress);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default getTotalScore; 
