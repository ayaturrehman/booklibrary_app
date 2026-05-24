export const metadata = {
  title: "Privacy Policy | ISC Academy",
  description: "Privacy policy for the ISC Academy mobile application.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          ISC Academy
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Effective date: 24 May 2026
        </p>

        <div className="mt-10 space-y-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <PolicySection title="Overview">
            <p>
              ISC Academy provides educational content, including study books,
              classes, subjects, chapters, and PDF reading features. This policy
              explains what information the app uses and how it is handled.
            </p>
          </PolicySection>

          <PolicySection title="Information We Collect">
            <p>
              The app may use basic device and network information required to
              connect to our content service, load books and PDFs, remember app
              preferences, and provide app functionality. If you contact us for
              support, we may receive the information you choose to provide.
            </p>
          </PolicySection>

          <PolicySection title="How We Use Information">
            <p>
              Information is used to operate the app, deliver educational
              content, maintain app performance, troubleshoot issues, and improve
              the learning experience. We do not sell personal information.
            </p>
          </PolicySection>

          <PolicySection title="Storage and Security">
            <p>
              The app may store preferences locally on your device. We use
              reasonable technical measures to protect our services, but no
              method of internet transmission or electronic storage is completely
              secure.
            </p>
          </PolicySection>

          <PolicySection title="Children">
            <p>
              ISC Academy is an education app. If the app is used by children,
              parents or guardians should supervise use. We do not knowingly sell
              children&apos;s personal information.
            </p>
          </PolicySection>

          <PolicySection title="Third-Party Services">
            <p>
              The app may connect to hosting, database, or platform services that
              help deliver app content and keep the service available. These
              providers process information only as needed to provide their
              services.
            </p>
          </PolicySection>

          <PolicySection title="Your Choices">
            <p>
              You can stop using the app at any time and may delete the app from
              your device to remove locally stored app data. For privacy requests,
              contact us using the details below.
            </p>
          </PolicySection>

          <PolicySection title="Contact Us">
            <p>
              If you have questions about this Privacy Policy, contact ISC
              Academy at:{" "}
              <a
                className="font-medium text-blue-700 underline"
                href="mailto:illuminatorsstudyclub92@gmail.com"
              >
                illuminatorsstudyclub92@gmail.com
              </a>
            </p>
          </PolicySection>
        </div>
      </section>
    </main>
  );
}

function PolicySection({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="leading-7 text-slate-700">{children}</div>
    </section>
  );
}