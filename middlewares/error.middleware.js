const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    console.log(error);
    console.log(error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message ?? "Internal sever error",
    });
  } catch (_err) {
    next(_err);
  }
};

export default errorMiddleware;
