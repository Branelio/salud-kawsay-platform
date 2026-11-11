import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JwtService } from './JwtService';
import { PasswordHasher } from './PasswordHasher';

describe('Capa de Seguridad - JWT y Hashing', () => {
  const jwtService = new JwtService('test-secret-key-12345');

  it('debe firmar y verificar un JWT correctamente', () => {
    const payload = {
      userId: 'usr-101',
      email: 'enfermera@saludkawsay.ec',
      role: 'nurse' as const
    };

    const token = jwtService.sign(payload, 3600);
    assert.ok(token);
    assert.strictEqual(token.split('.').length, 3);

    const verified = jwtService.verify(token);
    assert.strictEqual(verified.userId, payload.userId);
    assert.strictEqual(verified.email, payload.email);
    assert.strictEqual(verified.role, payload.role);
    assert.ok(verified.exp && verified.exp > Math.floor(Date.now() / 1000));
  });

  it('debe rechazar un token adulterado o con firma incorrecta', () => {
    const token = jwtService.sign({
      userId: 'usr-1',
      email: 'admin@saludkawsay.ec',
      role: 'admin' as const
    });

    const parts = token.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}.tamperedsignature`;

    assert.throws(() => {
      jwtService.verify(tamperedToken);
    }, /Firma de token inválida/);
  });

  it('debe hashear una contraseña y verificar coincidencia con salt', async () => {
    const rawPass = 'MiPasswordSeguro123!';
    const hash = await PasswordHasher.hash(rawPass);

    assert.ok(hash.includes(':'));
    const isMatch = await PasswordHasher.compare(rawPass, hash);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await PasswordHasher.compare('PasswordEquivocado', hash);
    assert.strictEqual(isWrongMatch, false);
  });
});

