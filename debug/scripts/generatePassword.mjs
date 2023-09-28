import bcrypt from 'bcryptjs';
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
    const salt = await bcrypt.genSalt(10 || args.salt);
    const hash = await bcrypt.hash(args.psw, salt);

    console.log('Requested password:');
    console.log(args.psw);
    console.log('Hashed password:');
    console.log('\x1b[42m\x1b[37m%s\x1b[0m', hash);
})();
