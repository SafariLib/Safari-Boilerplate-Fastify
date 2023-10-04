import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';
import getArgs from './getArgs.mjs';

/*
    Usage:
    node generatePassword.msj --psw=foo --salt=10   
    
    salt is optional

    Result:
    
    Requested password:
    P@ssword123!
    Hashed password:
    $2a$10$3yOahTlXmeVCHn4HvNPnOOa9cL4WCCfix2YtdFV.vjZDSBMRnJ9ny
*/

const args = getArgs();

(async () => {
    const psw =
        args.psw ??
        (await (async () => {
            const promise = new Promise(resolve => {
                const readline = createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                readline.question('Password: ', psw => {
                    readline.close();
                    resolve(psw);
                });
            });

            return await promise;
        })());

    const salt = await bcrypt.genSalt(args?.salt ? Number(args.salt) : 10);
    const hash = await bcrypt.hash(psw, salt);

    console.log();
    console.log('Hashed password:');
    console.log('\x1b[42m\x1b[37m%s\x1b[0m', hash);
    console.log();
})();
