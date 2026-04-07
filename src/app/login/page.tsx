import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { redirectAuthenticatedUser } from '@/lib/auth/middleware';

export default async function LoginPage() {
  await redirectAuthenticatedUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6 py-12">
      <AuthShell
        description="이전 세션의 맥락을 이어받아 발산·검증·종합·작성을 계속 진행하세요."
        linkHref="/signup"
        linkLabel="아직 계정이 없으신가요?"
        linkText="회원가입"
        title="로그인"
      >
        <LoginForm />
      </AuthShell>
    </main>
  );
}
