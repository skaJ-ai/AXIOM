async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { runApplicationBootstrap } = await import('@/lib/bootstrap');
  await runApplicationBootstrap();
}

export { register };
