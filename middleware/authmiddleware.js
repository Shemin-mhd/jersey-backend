import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            if (token === "undefined" || !token) {
                return res.status(401).json({ message: "Invalid token" });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {    
            return res.status(401).json({ message: "Not authorized" });
        }
    }
   
    if (!token) {
        return res.status(401).json({ message: "No token, not authorized" });
    }
};

export default protect;  
