const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        console.log('Authorization header missing');
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"

    // Check if the token is present and properly formatted
    if (!token) {
        console.log('Access token missing or improperly formatted');
        return res.status(401).json({ message: 'Access token missing or improperly formatted' });
    }

    // Verify the token
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        // Attach the decoded user information to the request
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;
