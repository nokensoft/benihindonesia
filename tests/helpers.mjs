// Pembantu pengujian: menjalankan `astro preview` dari hasil build (dist/) dan membuka Chrome/Edge
// yang sudah terpasang lewat playwright-core (tanpa mengunduh browser).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

export const PORT = 4399;
export const BASE = `http://localhost:${PORT}`;

export async function startServer() {
    if (!existsSync('dist/index.html')) throw new Error('dist/ belum ada. Jalankan `npm run build` dulu.');
    const proc = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--port', String(PORT)], {
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Server preview tidak siap dalam 30 detik')), 30000);
        const onData = (chunk) => {
            if (String(chunk).includes('localhost')) {
                clearTimeout(timer);
                resolve();
            }
        };
        proc.stdout.on('data', onData);
        proc.stderr.on('data', onData);
        proc.on('exit', (code) => reject(new Error(`Server preview berhenti (kode ${code})`)));
    });
    return { stop: () => proc.kill() };
}

export async function launchBrowser() {
    const errors = [];
    for (const channel of ['chrome', 'msedge']) {
        try {
            return await chromium.launch({ channel, headless: true });
        } catch (e) {
            errors.push(`${channel}: ${e.message.split('\n')[0]}`);
        }
    }
    throw new Error(`Chrome/Edge tidak ditemukan.\n${errors.join('\n')}`);
}
