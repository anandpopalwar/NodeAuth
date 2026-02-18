export const GetRandomData = (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Data got successfully",
    data: {
      random: Math.floor(Math.random() * 100),
    },
  });
};
