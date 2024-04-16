import { AppDataSource } from '../dataSource';
import { VerifyCode } from '../entities/VerifyCode';
import argon2 from 'argon2';
import { getUserById } from './UserModel';

const verifyCodeRepository = AppDataSource.getRepository(VerifyCode);

async function getVerifyCodeById(codeId: string): Promise<VerifyCode | null> {
    const code = await verifyCodeRepository.findOne({ where: { codeId }, 
        relations: [
        'user',
        ],
      });
    
    return code;
}

async function generateVerifyCode(userId: string): Promise<string | null> {
    const user = await getUserById(userId);
    var code;
    var codeValue = null;
    
    // only try to generate code if the user's email is not verified
    if (!user.verifiedEmail) {
        // if they already have a code and it hasn't been too long
        // since last code was generated, don't generate new one
        if (user.code.codeHash) {
            const ONE_HOUR_IN_MS = 60 * 60 * 1000; // 1 hour in milliseconds
            const timeSinceLastCode = Date.now() - user.code.timeSent.getTime(); // in milliseconds
            if (timeSinceLastCode > ONE_HOUR_IN_MS) {
                codeValue = (Math.floor(Math.random() * 100000) + 100000).toString();
                const hash = await argon2.hash(codeValue);
                code = user.code;
                code.timeSent = new Date();
                code.codeHash = hash;
            
                code = await verifyCodeRepository.save(code);
            }
        } else {
            codeValue = (Math.floor(Math.random() * 100000) + 100000).toString();
            const hash = await argon2.hash(codeValue);
            code = user.code;
            code.timeSent = new Date();
            code.codeHash = hash;
            
            code = await verifyCodeRepository.save(code);
        }
    }

    return codeValue;
}

export { getVerifyCodeById, generateVerifyCode };