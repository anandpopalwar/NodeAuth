const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    console.log(error);
    console.log(error.messege);
    res.status(error.statusCode || 500).json({
      success: false,
      messege: error.messege ?? "Internal sever error",
    });
  } catch (_err) {
    next(_err);
  }
};

export default errorMiddleware;
