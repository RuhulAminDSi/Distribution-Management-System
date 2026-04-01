const { spawn } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';

function startService(name, exePath) {
  return new Promise((resolve, reject) => {
    const args = exePath.includes('mysqld') ? ['--console'] : [];
    const proc = spawn(exePath, args, {
      detached: !isWindows,
      stdio: 'ignore',
      shell: isWindows
    });

    proc.unref();

    setTimeout(() => {
      console.log(`Started ${name} (PID: ${proc.pid})`);
      resolve(proc);
    }, 1000);
  });
}

async function checkServiceRunning(name) {
  return new Promise((resolve) => {
    const proc = spawn('tasklist', ['/FI', `IMAGENAME eq ${name}`], { shell: true });
    let output = '';
    proc.stdout.on('data', (data) => { output += data; });
    proc.on('close', () => {
      resolve(output.includes(name));
    });
  });
}

async function killService(name) {
  return new Promise((resolve) => {
    spawn('taskkill', ['/IM', name, '/F'], { shell: true })
      .on('close', () => resolve());
  });
}

async function main() {
  const services = [
    { name: 'mysqld.exe', exe: 'C:\\xampp\\mysql\\bin\\mysqld.exe' },
    { name: 'httpd.exe', exe: 'C:\\xampp\\apache\\bin\\httpd.exe' }
  ];

  const running = [];

  console.log('Starting MySQL and Apache...\n');

  for (const svc of services) {
    const isRunning = await checkServiceRunning(svc.name);
    if (!isRunning) {
      await startService(svc.name, svc.exe);
    } else {
      console.log(`${svc.name} already running`);
    }
    running.push(svc.name);
  }

  console.log('\nAll services started. Press Ctrl+C to stop.\n');

  const cleanup = async () => {
    console.log('\nStopping services...');
    for (const name of running) {
      await killService(name);
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main();