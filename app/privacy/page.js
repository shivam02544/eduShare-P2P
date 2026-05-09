import React from 'react';

export const metadata = {
  title: "Privacy Policy | EduShare",
  description: "Learn how EduShare collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  const lastUpdated = "May 9, 2026";

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
      </header>

      <section className="prose prose-invert max-w-none space-y-8">
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-text-2 leading-relaxed">
            Welcome to EduShare. We are committed to protecting your personal information and your right to privacy. 
            If you have any questions or concerns about our policy, or our practices with regards to your personal information, 
            please contact us.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">2. Information We Collect</h2>
          <p className="text-text-2 leading-relaxed">
            We collect personal information that you voluntarily provide to us when registering at the Services, 
            expressing an interest in obtaining information about us or our products and services, when participating in 
            activities on the Services or otherwise contacting us.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-text-2">
            <li><strong>Personal Data:</strong> Name, email address, profile picture, and educational background.</li>
            <li><strong>Content Data:</strong> Educational resources, notes, and videos you upload.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our platform, including search queries and view history.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">3. How We Use Your Information</h2>
          <p className="text-text-2 leading-relaxed">
            We use personal information collected via our Services for a variety of business purposes described below:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-text-2">
            <li>To facilitate account creation and logon process.</li>
            <li>To enable user-to-user communications and knowledge sharing.</li>
            <li>To enforce our terms, conditions and policies for Business Purposes.</li>
            <li>To respond to legal requests and prevent harm.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">4. Data Sharing and Disclosure</h2>
          <p className="text-text-2 leading-relaxed">
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, 
            or to fulfill business obligations. We do not sell your personal data to third parties.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">5. Data Security</h2>
          <p className="text-text-2 leading-relaxed">
            We aim to protect your personal information through a system of organizational and technical security measures. 
            However, please remember that no method of transmission over the internet is 100% secure.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">6. Your Privacy Rights</h2>
          <p className="text-text-2 leading-relaxed">
            Depending on your location, you may have the right to access, correct, or delete your personal information. 
            You can manage your profile settings within the EduShare dashboard.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">7. Contact Us</h2>
          <p className="text-text-2 leading-relaxed">
            If you have questions or comments about this policy, you may email us at support@edushare.com.
          </p>
        </div>
      </section>
    </div>
  );
}
