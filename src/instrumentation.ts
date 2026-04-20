async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { scheduleApplicationBootstrap } = await import('@/lib/bootstrap');
  scheduleApplicationBootstrap();
}

export { register };
