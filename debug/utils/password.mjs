import bcrypt from 'bcryptjs';

export const DEFAULT_PASSWORD = 'P@ssw0rdTest123';

export const generateRandomPassword = nbChar => {
    const password = [];
    for (let i = 0; i < nbChar; i++) {
        const availableChars = '!@#$%^&*()_+<>?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        password.push(availableChars[Math.floor(Math.random() * availableChars.length)]);
    }
    return password.join('');
};

export const generatePassword = (password = generateRandomPassword(24)) => {
    const salt = bcrypt.genSaltSync(10);
    return {
        password,
        hashedPassword: bcrypt.hashSync(password, salt),
    };
};

export const generateDefaultPassword = () => generatePassword(DEFAULT_PASSWORD);
