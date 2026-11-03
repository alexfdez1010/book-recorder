import { BrandMark } from '@/components/brand-mark';
import { BookOpen } from 'lucide-react';
import { LoginForm } from '@/components/login-form';

/** Renders the accessible sign-in form and optional authentication error. */
export default function LoginPage() {
  return (
    <main className="lib-login">
      <section
        className="lib-login-story"
        aria-label="Your personal reading library"
      >
        <span className="flex items-center gap-3 text-sm font-medium">
          <BrandMark size={36} />
          Book Recorder
        </span>
        <div>
          <p className="lib-login-story__title">
            A life
            <br />
            in books
          </p>
          <p className="mt-6 max-w-xs text-base leading-relaxed text-ink-soft">
            Keep the stories that stay with you. Make room for the ones still to
            come.
          </p>
          <div className="lib-login-books" aria-hidden="true">
            <div className="lib-login-volume bg-leather">
              <BookOpen size={20} strokeWidth={1.3} />
              <span>
                The stories
                <br />
                we keep
              </span>
            </div>
            <div className="lib-login-volume bg-[#a88c65]">
              <span className="text-sm">Book Recorder</span>
              <span>
                One more
                <br />
                chapter
              </span>
            </div>
            <div className="lib-login-volume bg-[#64796c]">
              <BookOpen size={18} strokeWidth={1.3} />
              <span>
                A world
                <br />
                within
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-ink-soft">
          Your personal library, thoughtfully kept
        </p>
      </section>
      <div className="lib-login-form-area">
        <LoginForm />
      </div>
    </main>
  );
}
