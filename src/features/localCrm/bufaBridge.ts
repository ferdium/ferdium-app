import { readFileSync } from 'node:fs';
import http from 'node:http';
import { homedir } from 'node:os';
import { join } from 'node:path';

interface BridgeConfig {
  token: string;
  port: number;
}

interface BridgeResponse {
  ok: boolean;
  result?: unknown;
  error?: string;
}

const bridgeFile = join(
  homedir(),
  'Library/Application Support/bufa-hau-dai-checker/ferdium-bridge.json',
);

const readConfig = (): BridgeConfig => {
  try {
    const config = JSON.parse(readFileSync(bridgeFile, 'utf8')) as BridgeConfig;
    if (!config.token || !Number.isInteger(config.port)) throw new Error();
    return config;
  } catch {
    throw new Error('Hãy mở Hậu đài BUFA trước khi kiểm tra');
  }
};

const requestBufa = (
  path: '/v1/check' | '/v1/deposits',
  stream: 'BSPORT' | 'VSPORT',
  account: string,
  includeDepositHistory = false,
): Promise<unknown> => {
  const { token, port } = readConfig();

  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      response => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => {
          body += chunk;
          if (body.length > 1_000_000)
            request.destroy(new Error('Phản hồi từ BUFA quá lớn'));
        });
        response.on('end', () => {
          try {
            const data = JSON.parse(body) as BridgeResponse;
            if (data.ok) resolve(data.result);
            else
              reject(
                new Error(
                  data.error || 'Hậu đài BUFA không thể kiểm tra tài khoản',
                ),
              );
          } catch (error) {
            reject(error);
          }
        });
      },
    );
    request.setTimeout(60_000, () =>
      request.destroy(new Error('Hậu đài BUFA phản hồi quá lâu')),
    );
    request.on('error', error => {
      if ('code' in error && error.code === 'ECONNREFUSED') {
        reject(new Error('Hãy mở Hậu đài BUFA trước khi kiểm tra'));
      } else {
        reject(error);
      }
    });
    request.end(JSON.stringify({ stream, account, includeDepositHistory }));
  });
};

export const checkBufa = (
  stream: 'BSPORT' | 'VSPORT',
  account: string,
  includeDepositHistory = false,
) => requestBufa('/v1/check', stream, account, includeDepositHistory);

export const fetchBufaDeposits = (
  stream: 'BSPORT' | 'VSPORT',
  account: string,
) => requestBufa('/v1/deposits', stream, account);
