import React from 'react';

export const metadata = {
  title: "Terms of Service | EduShare",
  description: "Read the terms and conditions for using the EduShare platform.",
};

export default function TermsPage() {
  const lastUpdated = "May 9, 2026";

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms of Service</h1>
        <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
      </header>

      <section className="prose prose-invert max-w-none space-y-8">
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p className="text-text-2 leading-relaxed">
            By accessing or using EduShare, you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access the service.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">2. User Conduct</h2>
          <p className="text-text-2 leading-relaxed">
            EduShare is a peer-to-peer learning platform. You agree to use the service only for lawful purposes 
            and in a way that does not infringe the rights of others. Prohibited behavior includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-text-2">
            <li>Harassing or abusing other users.</li>
            <li>Uploading malicious code or viruses.</li>
            <li>Attempting to gain unauthorized access to the platform's systems.</li>
            <li>Posting spam or deceptive commercial content.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">3. Intellectual Property</h2>
          <p className="text-text-2 leading-relaxed">
            You retain ownership of the content you upload to EduShare. However, by uploading content, 
            you grant EduShare a non-exclusive, worldwide, royalty-free license to use, display, and distribute 
            that content within the platform for educational purposes.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">4. Resource Sharing & Academic Integrity</h2>
          <p className="text-text-2 leading-relaxed">
            EduShare is intended for supplemental learning. You agree not to use the platform to facilitate 
            academic dishonesty, such as sharing exam answers or completing assignments for others in violation 
            of institutional policies.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">5. Account Responsibility</h2>
          <p className="text-text-2 leading-relaxed">
            You are responsible for safeguarding your account credentials. You must notify us immediately 
            upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">6. Termination</h2>
          <p className="text-text-2 leading-relaxed">
            We may terminate or suspend your account immediately, without prior notice or liability, 
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">7. Limitation of Liability</h2>
          <p className="text-text-2 leading-relaxed">
            EduShare is provided "AS IS" without warranty of any kind. In no event shall EduShare be liable 
            for any indirect, incidental, special, or consequential damages arising out of your use of the service.
          </p>
        </div>
      </section>
    </div>
  );
}
