const { User, Buyer, Seller, DeliveryPerson, Admin } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const e = require("../utils/error");

require("dotenv").config();

module.exports = {
    // 🔹 SIGNUP
    signup: async (req, res, next) => {
        try {
            const { name, email, password, confirmPassword, role, address, phoneNumber, shopName, headquartersAddress, vehicleType } = req.body;

            // Vérifier si l'email existe déjà
            if (await User.findOne({ email })) {
                return next(e.errorHandler(400, "Email already in use"));
            }

            // Vérifier si les mots de passe correspondent
            if (password !== confirmPassword) {
                return next(e.errorHandler(400, "Passwords do not match"));
            }

            // Hashage du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Définir "buyer" par défaut si le rôle n'est pas fourni
            const userRole = role || "buyer"; 

            let newUser;
            const userData = { name, email, password: hashedPassword, role: userRole };

            switch (userRole) {
                case "buyer":
                    if (!address || !phoneNumber) {
                        return next(e.errorHandler(400, "Buyer must have address and phone number"));
                    }
                    newUser = new Buyer({ ...userData, address, phoneNumber });
                    break;
                case "seller":
                    if (!shopName || !headquartersAddress) {
                        return next(e.errorHandler(400, "Seller must have shop name and headquarters address"));
                    }
                    newUser = new Seller({ ...userData, shopName, headquartersAddress });
                    break;
                case "delivery":
                    if (!vehicleType) {
                        return next(e.errorHandler(400, "Delivery person must have vehicle type"));
                    }
                    newUser = new DeliveryPerson({ ...userData, vehicleType });
                    break;
                case "admin":
                    newUser = new Admin(userData);
                    break;
                default:
                    return next(e.errorHandler(400, "Invalid role"));
            }

            await newUser.save();
            res.status(201).json({ message: "User registered successfully", user: newUser });
        } catch (error) {
            next(error);
        }
    },

    // 🔹 SIGNIN
    signin: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Vérifier si l'utilisateur existe
            const user = await User.findOne({ email });
            if (!user) return next(e.errorHandler(400, "Invalid email or password"));

            // Vérifier le mot de passe
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return next(e.errorHandler(400, "Invalid email or password"));

            // Vérifier si le compte est actif
            if (!user.isActive) {
                return next(e.errorHandler(403, "Your account has been deactivated"));
            }

            // Générer le token JWT
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            // Envoyer le token dans un cookie sécurisé
            res.cookie("access_token", token, {
                httpOnly: true, // Sécuriser l'accès du cookie
                secure: process.env.NODE_ENV === "production", // Si en production, utiliser HTTPS
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
            });

            // Réponse avec les détails de l'utilisateur
            res.status(200).json({
                message: "Signin successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            next(error);
        }
    }
};
