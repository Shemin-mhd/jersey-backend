import jwt from "jsonwebtoken";

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "2d" });
};
