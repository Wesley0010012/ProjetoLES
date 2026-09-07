import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { Encrypter } from 'src/shared/domain/protocols/cryptography/Encrypter';
import { Validator } from 'src/shared/domain/protocols/cryptography/Validator';

const scrypt = promisify(nodeScrypt);

export class ScryptAdapter implements Encrypter, Validator {
  public async encrypt(plaintext: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(plaintext, salt, 64)) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }

  public async validate(
    plaintext: string,
    encryptedText: string,
  ): Promise<boolean> {
    const [salt, storedKey] = encryptedText.split(':');

    if (!salt || !storedKey) {
      return false;
    }

    const storedKeyBuffer = Buffer.from(storedKey, 'hex');
    const derivedKey = (await scrypt(
      plaintext,
      salt,
      storedKeyBuffer.length,
    )) as Buffer;

    return (
      storedKeyBuffer.length === derivedKey.length &&
      timingSafeEqual(storedKeyBuffer, derivedKey)
    );
  }
}
