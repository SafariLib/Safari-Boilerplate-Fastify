import bcrypt from 'bcryptjs';

export const DEFAULT_PASSWORD = 'P@ssw0rdTest123';

export const hashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

export const generateRandomPassword = (nbChar = 24) => {
    const password = [];
    for (let i = 0; i < nbChar; i++) {
        const availableChars = '!@#$%^&*()_+<>?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        password.push(availableChars[Math.floor(Math.random() * availableChars.length)]);
    }
    return password.join('');
};

export const generateHashedPassword = (password = generateRandomPassword(24)) => {
    const salt = bcrypt.genSaltSync(10);
    return {
        password,
        hashedPassword: bcrypt.hashSync(password, salt),
    };
};

export const generateHashedDefaultPassword = () => generateHashedPassword(DEFAULT_PASSWORD);
